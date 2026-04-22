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
@Document(collection = "risk_assessments")
public class RiskAssessment {

    @Id
    private String id;

    private String sessionId;
    private String userId;
    private Map<String, Integer> answers;
    private int score;
    private String riskLevel;         // LOW, MEDIUM, HIGH
    private List<String> recommendations;

    private LocalDateTime completedAt = LocalDateTime.now();
}
