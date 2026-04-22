package com.university.cybersystem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "training_videos")
public class TrainingVideo {

    @Id
    private String id;

    private String title;
    private String description;
    private String youtubeUrl;       // Full YouTube URL e.g. https://www.youtube.com/watch?v=xxx
    private String youtubeVideoId;   // Extracted video ID for embed
    private String category;         // PHISHING, PASSWORD_SECURITY, DATA_PRIVACY, MALWARE, GENERAL
    private String duration;         // e.g. "8 min"
    private String addedBy;          // Admin name
    private String addedById;        // Admin user ID

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Helper: extract YouTube video ID from URL
    public void setYoutubeUrl(String url) {
        this.youtubeUrl = url;
        if (url != null) {
            this.youtubeVideoId = extractVideoId(url);
        }
    }

    private String extractVideoId(String url) {
        if (url == null) return null;
        // Handle: https://www.youtube.com/watch?v=VIDEO_ID
        if (url.contains("watch?v=")) {
            String id = url.substring(url.indexOf("watch?v=") + 8);
            if (id.contains("&")) id = id.substring(0, id.indexOf("&"));
            return id;
        }
        // Handle: https://youtu.be/VIDEO_ID
        if (url.contains("youtu.be/")) {
            String id = url.substring(url.indexOf("youtu.be/") + 9);
            if (id.contains("?")) id = id.substring(0, id.indexOf("?"));
            return id;
        }
        // Handle: https://www.youtube.com/embed/VIDEO_ID
        if (url.contains("/embed/")) {
            String id = url.substring(url.indexOf("/embed/") + 7);
            if (id.contains("?")) id = id.substring(0, id.indexOf("?"));
            return id;
        }
        return null;
    }
}
