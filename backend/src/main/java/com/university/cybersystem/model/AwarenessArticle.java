package com.university.cybersystem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "awareness_articles")
public class AwarenessArticle {

    @Id
    private String id;

    private String title;
    private String content;
    private String category; // PHISHING, PASSWORD_SECURITY, DATA_PRIVACY, MALWARE, GENERAL
    private String authorId;
    private String authorName;
    private String imageUrl;  // NEW: banner/cover image for the article
    private List<String> attachments = new ArrayList<>(); // NEW: attached files/images

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
