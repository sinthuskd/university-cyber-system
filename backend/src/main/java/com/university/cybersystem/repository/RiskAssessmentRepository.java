package com.university.cybersystem.repository;

import com.university.cybersystem.model.RiskAssessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface RiskAssessmentRepository extends MongoRepository<RiskAssessment, String> {
    List<RiskAssessment> findByUserIdOrderByCompletedAtDesc(String userId);
    Optional<RiskAssessment> findBySessionId(String sessionId);
}
