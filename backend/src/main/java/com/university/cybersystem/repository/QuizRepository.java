package com.university.cybersystem.repository;

import com.university.cybersystem.model.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuizRepository extends MongoRepository<Quiz, String> {
}
