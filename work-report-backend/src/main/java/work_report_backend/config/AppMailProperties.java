package work_report_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.mail")
public class AppMailProperties {

    private String from = "noreply@workreport.local";
    private String fromName = "Work Report";
    private String replyTo;
    private boolean enabled = true;

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getFromName() {
        return fromName;
    }

    public void setFromName(String fromName) {
        this.fromName = fromName;
    }

    public String getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getFormattedFrom() {
        if (fromName != null && !fromName.isBlank()) {
            return fromName + " <" + from + ">";
        }
        return from;
    }
}
