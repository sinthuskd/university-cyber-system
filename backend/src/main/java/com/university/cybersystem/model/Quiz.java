package com.university.cybersystem.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "quizzes")
public class Quiz {

    @Id
    private String id;

    private String title;
    private String description;
    private Integer timeLimitMinutes; // null = no limit
    private List<QuizQuestion> questions;
    private LocalDateTime createdAt = LocalDateTime.now();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizQuestion {
        private String question;
        private List<String> options;
        private int correctAnswer; // index
    }
}
