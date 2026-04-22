package com.university.cybersystem.controller;

import com.university.cybersystem.model.EthicalCase;
import com.university.cybersystem.model.User;
import com.university.cybersystem.repository.EthicalCaseRepository;
import com.university.cybersystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ethical")
@RequiredArgsConstructor
public class EthicalController {

    private final EthicalCaseRepository ethicalCaseRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<EthicalCase>> getCases(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(ethicalCaseRepository.findAllByOrderByCreatedAtDesc());
        }
        return ResponseEntity.ok(ethicalCaseRepository.findBySubmittedByOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCaseById(@PathVariable String id) {
        return ethicalCaseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCase(@RequestBody EthicalCase ethicalCase, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        ethicalCase.setSubmittedBy(user.getId());
        ethicalCase.setSubmittedByName(user.getName());
        ethicalCase.setStatus("PENDING");
        ethicalCase.setCreatedAt(LocalDateTime.now());
        ethicalCase.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(ethicalCaseRepository.save(ethicalCase));
    }

    // Submit appeal (same as create case)
    @PostMapping("/appeals")
    public ResponseEntity<?> submitAppeal(@RequestBody EthicalCase appeal, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        appeal.setSubmittedBy(user.getId());
        appeal.setSubmittedByName(user.getName());
        appeal.setStatus("PENDING");
        appeal.setCreatedAt(LocalDateTime.now());
        appeal.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(ethicalCaseRepository.save(appeal));
    }

    @GetMapping("/appeals")
    public ResponseEntity<List<EthicalCase>> getAppeals(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(ethicalCaseRepository.findAllByOrderByCreatedAtDesc());
        }
        return ResponseEntity.ok(ethicalCaseRepository.findBySubmittedByOrderByCreatedAtDesc(user.getId()));
    }

    @PutMapping("/{id}/decision")
    public ResponseEntity<?> updateDecision(@PathVariable String id,
                                             @RequestBody Map<String, String> body,
                                             Authentication auth) {
        return ethicalCaseRepository.findById(id).map(c -> {
            c.setDecision(body.get("decision"));
            c.setReason(body.get("reason"));
            c.setDecidedBy(auth.getName());
            c.setStatus(body.get("decision"));
            c.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(ethicalCaseRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/appeals/{id}")
    public ResponseEntity<?> updateAppealStatus(@PathVariable String id,
                                                 @RequestBody Map<String, String> body) {
        return ethicalCaseRepository.findById(id).map(c -> {
            c.setStatus(body.get("status"));
            c.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(ethicalCaseRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCase(@PathVariable String id) {
        if (!ethicalCaseRepository.existsById(id)) return ResponseEntity.notFound().build();
        ethicalCaseRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Case deleted"));
    }
}
