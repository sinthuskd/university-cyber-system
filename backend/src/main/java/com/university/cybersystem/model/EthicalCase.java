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
@Document(collection = "ethical_cases")
public class EthicalCase {

    @Id
    private String id;

    private String title;
    private String description;
    private String type;           // GRADE_APPEAL, DISCIPLINARY_APPEAL, ETHICAL_CONCERN, etc.
    private String status;         // PENDING, APPROVED, REJECTED, UNDER_REVIEW
    private String submittedBy;
    private String submittedByName;
    private String relatedCaseId;
    private String evidence;

    private String decision;
    private String reason;
    private String decidedBy;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}
