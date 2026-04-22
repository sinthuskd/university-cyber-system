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
@Document(collection = "quiz_results")
public class QuizResult {

    @Id
    private String id;

    private String quizId;
    private String quizTitle;
    private String userId;
    private String userName;
    private String userEmail;
    private String userDepartment;

    private int score;       // percentage 0-100
    private int correct;
    private int total;
    private boolean passed;  // score >= 70
    private long durationSeconds; // time taken

    private LocalDateTime submittedAt = LocalDateTime.now();
}
