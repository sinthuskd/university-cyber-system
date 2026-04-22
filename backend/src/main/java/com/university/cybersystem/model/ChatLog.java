package com.university.cybersystem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_logs")
public class ChatLog {

    @Id
    private String id;

    private String userId;
    private String firstMessage;
    private List<Map<String, String>> messages;
    private LocalDateTime createdAt = LocalDateTime.now();
}
