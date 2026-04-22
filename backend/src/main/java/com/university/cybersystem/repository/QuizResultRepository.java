package com.university.cybersystem.repository;

import com.university.cybersystem.model.QuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface QuizResultRepository extends MongoRepository<QuizResult, String> {
    List<QuizResult> findByUserIdOrderBySubmittedAtDesc(String userId);
    List<QuizResult> findAllByOrderBySubmittedAtDesc();
    List<QuizResult> findByQuizIdOrderBySubmittedAtDesc(String quizId);
}
