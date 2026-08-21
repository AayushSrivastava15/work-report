package work_report_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to protect against brute-force login attempts and automated attacks.
 * Temporarily locks accounts after 5 consecutive failed attempts for 15 minutes.
 */
@Service
public class LoginAttemptService {

    private static final Logger log = LoggerFactory.getLogger(LoginAttemptService.class);
    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private static class AttemptInfo {
        int failedAttempts;
        LocalDateTime lastAttempt;
        LocalDateTime lockedUntil;

        AttemptInfo(int failedAttempts, LocalDateTime lastAttempt) {
            this.failedAttempts = failedAttempts;
            this.lastAttempt = lastAttempt;
        }
    }

    private final ConcurrentHashMap<String, AttemptInfo> attemptsCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        if (key != null) {
            attemptsCache.remove(key.trim().toLowerCase());
        }
    }

    public void loginFailed(String key) {
        if (key == null) return;
        String normalizedKey = key.trim().toLowerCase();
        LocalDateTime now = LocalDateTime.now();

        attemptsCache.compute(normalizedKey, (k, info) -> {
            if (info == null) {
                return new AttemptInfo(1, now);
            }

            // If lock expired, reset
            if (info.lockedUntil != null && now.isAfter(info.lockedUntil)) {
                return new AttemptInfo(1, now);
            }

            info.failedAttempts++;
            info.lastAttempt = now;

            if (info.failedAttempts >= MAX_ATTEMPTS) {
                info.lockedUntil = now.plusMinutes(LOCKOUT_MINUTES);
                log.warn("Security Alert: Key '{}' exceeded {} failed login attempts. Temporarily locked until {}.",
                        k, MAX_ATTEMPTS, info.lockedUntil);
            }
            return info;
        });
    }

    public boolean isBlocked(String key) {
        if (key == null) return false;
        String normalizedKey = key.trim().toLowerCase();
        AttemptInfo info = attemptsCache.get(normalizedKey);

        if (info == null || info.lockedUntil == null) {
            return false;
        }

        if (LocalDateTime.now().isAfter(info.lockedUntil)) {
            // Lock expired, remove from cache
            attemptsCache.remove(normalizedKey);
            return false;
        }

        return true;
    }

    public int getRemainingLockMinutes(String key) {
        if (key == null) return 0;
        AttemptInfo info = attemptsCache.get(key.trim().toLowerCase());
        if (info == null || info.lockedUntil == null) return 0;

        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(info.lockedUntil)) return 0;

        return (int) java.time.Duration.between(now, info.lockedUntil).toMinutes() + 1;
    }
}
