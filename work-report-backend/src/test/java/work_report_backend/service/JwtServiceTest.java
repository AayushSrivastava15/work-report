package work_report_backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import work_report_backend.entity.User;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String testSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long testExpiration = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", testSecret);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", testExpiration);
    }

    @Test
    void testGenerateTokenAndExtractClaims() {
        User user = new User("Alice Developer", "alice@example.com", "hashedpass");
        user.setId(10L);

        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isBlank());

        String extractedEmail = jwtService.extractEmail(token);
        Long extractedUserId = jwtService.extractUserId(token);
        Date expiration = jwtService.extractExpiration(token);

        assertEquals("alice@example.com", extractedEmail);
        assertEquals(10L, extractedUserId);
        assertTrue(expiration.after(new Date()));
        assertTrue(jwtService.isTokenValid(token));
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void testTokenExpiration() {
        // Create an expired token with negative expiration
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);
        User user = new User("Bob", "bob@example.com", "hashedpass");
        user.setId(20L);

        String expiredToken = jwtService.generateToken(user);

        assertNotNull(expiredToken);
        assertTrue(jwtService.isTokenExpired(expiredToken));
        assertFalse(jwtService.isTokenValid(expiredToken));
    }

    @Test
    void testInvalidTokenHandling() {
        assertFalse(jwtService.isTokenValid("invalid.jwt.token"));
        assertFalse(jwtService.isTokenValid(""));
    }
}
