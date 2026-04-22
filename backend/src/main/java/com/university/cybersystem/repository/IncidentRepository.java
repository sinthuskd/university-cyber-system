package com.university.cybersystem.repository;

import com.university.cybersystem.model.Incident;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface IncidentRepository extends MongoRepository<Incident, String> {
    List<Incident> findByReportedByOrderByCreatedAtDesc(String reportedBy);
    List<Incident> findAllByOrderByCreatedAtDesc();
}
