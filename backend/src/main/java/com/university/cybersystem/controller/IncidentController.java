package com.university.cybersystem.controller;

import com.university.cybersystem.model.Incident;
import com.university.cybersystem.model.User;
import com.university.cybersystem.repository.IncidentRepository;
import com.university.cybersystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    // Create a cyber incident
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Incident incident, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        incident.setReportedBy(user.getId());
        incident.setReportedByName(user.getName());
        incident.setStatus("OPEN");
        incident.setCreatedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(incidentRepository.save(incident));
    }

    // Create academic violation
    @PostMapping("/academic")
    public ResponseEntity<?> createAcademic(@RequestBody Incident incident, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        incident.setReportedBy(user.getId());
        incident.setReportedByName(user.getName());
        incident.setType("ACADEMIC_VIOLATION");
        incident.setStatus("OPEN");
        incident.setCreatedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(incidentRepository.save(incident));
    }

    // Get all incidents (admin sees all, users see own)
    @GetMapping
    public ResponseEntity<List<Incident>> getAll(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(incidentRepository.findAllByOrderByCreatedAtDesc());
        }
        return ResponseEntity.ok(incidentRepository.findByReportedByOrderByCreatedAtDesc(user.getId()));
    }

    // Get my incidents
    @GetMapping("/my")
    public ResponseEntity<List<Incident>> getMine(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(incidentRepository.findByReportedByOrderByCreatedAtDesc(user.getId()));
    }

    // Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return incidentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update full incident
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Incident updated) {
        return incidentRepository.findById(id).map(inc -> {
            inc.setTitle(updated.getTitle());
            inc.setDescription(updated.getDescription());
            inc.setSeverity(updated.getSeverity());
            inc.setAffectedSystems(updated.getAffectedSystems());
            inc.setActionsTaken(updated.getActionsTaken());
            inc.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(incidentRepository.save(inc));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Update status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return incidentRepository.findById(id).map(inc -> {
            inc.setStatus(body.get("status"));
            inc.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(incidentRepository.save(inc));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Add note
    @PostMapping("/{id}/notes")
    public ResponseEntity<?> addNote(@PathVariable String id, @RequestBody Map<String, String> body) {
        return incidentRepository.findById(id).map(inc -> {
            inc.getNotes().add(body.get("note"));
            inc.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(incidentRepository.save(inc));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Upload evidence files for an incident
    @PostMapping("/{id}/evidence")
    public ResponseEntity<?> uploadEvidence(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files) {
        return incidentRepository.findById(id).map(inc -> {
            Path uploadsDir = Paths.get("uploads");
            try {
                if (!Files.exists(uploadsDir)) Files.createDirectories(uploadsDir);
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of("message", "Could not create upload directory"));
            }
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                try {
                    String original = file.getOriginalFilename();
                    String ext = (original != null && original.contains("."))
                            ? original.substring(original.lastIndexOf("."))
                            : "";
                    String filename = UUID.randomUUID().toString() + ext;
                    Path dest = uploadsDir.resolve(filename);
                    file.transferTo(dest);
                    inc.getEvidenceFiles().add("/uploads/" + filename);
                } catch (IOException e) {
                    // skip failed file but continue
                }
            }
            inc.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(incidentRepository.save(inc));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete incident
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!incidentRepository.existsById(id)) return ResponseEntity.notFound().build();
        incidentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}
