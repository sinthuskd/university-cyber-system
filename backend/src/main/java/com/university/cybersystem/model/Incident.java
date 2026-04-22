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
@Document(collection = "incidents")
public class Incident {

    @Id
    private String id;

    private String title;
    private String description;
    private String type;          // PHISHING, MALWARE, DATA_BREACH, UNAUTHORIZED_ACCESS, etc.
    private String severity;      // LOW, MEDIUM, HIGH, CRITICAL
    private String status;        // OPEN, INVESTIGATING, ESCALATED, RESOLVED
    private String reportedBy;    // user ID
    private String reportedByName;
    private String affectedSystems;
    private String actionsTaken;
    private String violationType; // For academic violations
    private String course;
    private String evidence;

    private List<String> notes = new ArrayList<>();
    private List<String> evidenceFiles = new ArrayList<>();

    private LocalDateTime incidentDate;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
