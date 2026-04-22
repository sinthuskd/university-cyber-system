package com.university.cybersystem.repository;

import com.university.cybersystem.model.ChatLog;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatLogRepository extends MongoRepository<ChatLog, String> {
    List<ChatLog> findByUserIdOrderByCreatedAtDesc(String userId);
    void deleteByUserId(String userId);
}
