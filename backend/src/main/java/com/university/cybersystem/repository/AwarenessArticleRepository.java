package com.university.cybersystem.repository;

import com.university.cybersystem.model.AwarenessArticle;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AwarenessArticleRepository extends MongoRepository<AwarenessArticle, String> {
    List<AwarenessArticle> findAllByOrderByCreatedAtDesc();
}
