package com.university.cybersystem.repository;

import com.university.cybersystem.model.EthicalCase;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface EthicalCaseRepository extends MongoRepository<EthicalCase, String> {
    List<EthicalCase> findAllByOrderByCreatedAtDesc();
    List<EthicalCase> findBySubmittedByOrderByCreatedAtDesc(String submittedBy);
}
