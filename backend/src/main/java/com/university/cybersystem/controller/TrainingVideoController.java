package com.university.cybersystem.controller;

import com.university.cybersystem.model.TrainingVideo;
import com.university.cybersystem.model.User;
import com.university.cybersystem.repository.TrainingVideoRepository;
import com.university.cybersystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/awareness/videos")
@RequiredArgsConstructor
public class TrainingVideoController {

    private final TrainingVideoRepository videoRepository;
    private final UserRepository userRepository;

    // ── GET all videos (accessible to all authenticated users) ──
    @GetMapping
    public ResponseEntity<List<TrainingVideo>> getAllVideos() {
        return ResponseEntity.ok(videoRepository.findAllByOrderByCreatedAtDesc());
    }

    // ── GET videos by category ──
    @GetMapping("/category/{category}")
    public ResponseEntity<List<TrainingVideo>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(videoRepository.findByCategoryOrderByCreatedAtDesc(category));
    }

    // ── GET single video ──
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return videoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── POST create video (Admin only) ──
    @PostMapping
    public ResponseEntity<?> createVideo(@RequestBody TrainingVideo video, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        video.setAddedBy(user.getName());
        video.setAddedById(user.getId());
        video.setCreatedAt(LocalDateTime.now());
        video.setUpdatedAt(LocalDateTime.now());
        // Re-set URL to trigger video ID extraction
        video.setYoutubeUrl(video.getYoutubeUrl());
        return ResponseEntity.ok(videoRepository.save(video));
    }

    // ── PUT update video (Admin only) ──
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVideo(@PathVariable String id, @RequestBody TrainingVideo updated) {
        return videoRepository.findById(id).map(v -> {
            v.setTitle(updated.getTitle());
            v.setDescription(updated.getDescription());
            v.setYoutubeUrl(updated.getYoutubeUrl()); // triggers video ID extraction
            v.setCategory(updated.getCategory());
            v.setDuration(updated.getDuration());
            v.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(videoRepository.save(v));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE video (Admin only) ──
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVideo(@PathVariable String id) {
        if (!videoRepository.existsById(id)) return ResponseEntity.notFound().build();
        videoRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Video deleted"));
    }
}
