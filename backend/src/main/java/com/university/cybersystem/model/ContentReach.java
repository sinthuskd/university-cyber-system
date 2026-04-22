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
@Document(collection = "content_reach")
public class ContentReach {

    @Id
    private String id;

    private String contentId;    // article or video id
    private String contentType;  // ARTICLE or VIDEO
    private String contentTitle;

    private String userId;
    private String userName;
    private String userEmail;

    private LocalDateTime viewedAt = LocalDateTime.now();
}
