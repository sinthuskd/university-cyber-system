package com.university.cybersystem.repository;

import com.university.cybersystem.model.TrainingVideo;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TrainingVideoRepository extends MongoRepository<TrainingVideo, String> {
    List<TrainingVideo> findAllByOrderByCreatedAtDesc();
    List<TrainingVideo> findByCategoryOrderByCreatedAtDesc(String category);
}
