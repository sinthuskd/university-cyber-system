package com.university.cybersystem.repository;

import com.university.cybersystem.model.ContentReach;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ContentReachRepository extends MongoRepository<ContentReach, String> {
    List<ContentReach> findByContentIdOrderByViewedAtDesc(String contentId);
    long countByContentId(String contentId);
    long countByContentIdAndUserId(String contentId, String userId);
    List<ContentReach> findAllByOrderByViewedAtDesc();
    List<ContentReach> findByContentTypeOrderByViewedAtDesc(String contentType);
}
