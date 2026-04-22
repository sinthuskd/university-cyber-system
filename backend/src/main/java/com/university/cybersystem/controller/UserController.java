package com.university.cybersystem.controller;

import com.university.cybersystem.model.User;
import com.university.cybersystem.repository.UserRepository;
import com.university.cybersystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // ─── Helper: strip password before returning ───────────────────────────────
    private Map<String, Object> toDto(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",              u.getId());
        m.put("name",            u.getName());
        m.put("email",           u.getEmail());
        m.put("role",            u.getRole());
        m.put("phone",           u.getPhone());
        m.put("department",      u.getDepartment());
        m.put("studentId",       u.getStudentId());
        m.put("createdAt",       u.getCreatedAt());
        String img = u.getProfileImageUrl();
        if (img != null && img.startsWith("/"))
            img = "http://localhost:8080" + img;
        m.put("profileImageUrl", img);
        return m;
    }

    // ─── ADMIN: Get all users ──────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllUsers(Authentication auth) {
        User caller = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (!"ADMIN".equals(caller.getRole()))
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        List<Map<String, Object>> list = userRepository.findAll()
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // ─── ADMIN: Get single user ────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable String id, Authentication auth) {
        User caller = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (!"ADMIN".equals(caller.getRole()) && !caller.getId().equals(id))
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(toDto(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── ADMIN: Create user ────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> req, Authentication auth) {
        User caller = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (!"ADMIN".equals(caller.getRole()))
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));

        String email = req.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        if (userRepository.existsByEmail(email))
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));

        String password = req.get("password");
        if (password == null || password.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));

        User user = new User();
        user.setName(req.getOrDefault("name", ""));
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(req.getOrDefault("role", "USER").toUpperCase());
        user.setPhone(req.get("phone"));
        user.setDepartment(req.get("department"));
        user.setStudentId("STU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    // ─── ADMIN: Update user (name, role, phone, department) ───────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id,
                                        @RequestBody Map<String, String> req,
                                        Authentication auth) {
        User caller = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (!"ADMIN".equals(caller.getRole()))
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));

        return userRepository.findById(id).map(user -> {
            if (req.containsKey("name"))       user.setName(req.get("name"));
            if (req.containsKey("role"))       user.setRole(req.get("role").toUpperCase());
            if (req.containsKey("phone"))      user.setPhone(req.get("phone"));
            if (req.containsKey("department")) user.setDepartment(req.get("department"));
            userRepository.save(user);
            return ResponseEntity.ok(toDto(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── ADMIN: Delete user ────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id, Authentication auth) {
        User caller = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (!"ADMIN".equals(caller.getRole()))
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        if (caller.getId().equals(id))
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete yourself"));
        if (!userRepository.existsById(id))
            return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // ─── ADMIN: Reset another user's password ─────────────────────────────────
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> adminResetPassword(@PathVariable String id,
                                                @RequestBody Map<String, String> req,
                                                Authentication auth) {
        User caller = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (!"ADMIN".equals(caller.getRole()))
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));

        String newPassword = req.get("newPassword");
        if (newPassword == null || newPassword.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters"));

        return userRepository.findById(id).map(user -> {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── USER: Update own profile (name, phone, department) ───────────────────
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> req, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        if (req.containsKey("name"))       user.setName(req.get("name"));
        if (req.containsKey("phone"))      user.setPhone(req.get("phone"));
        if (req.containsKey("department")) user.setDepartment(req.get("department"));
        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    // ─── USER: Upload own profile image ───────────────────────────────────────
    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file,
                                                Authentication auth) {
        if (file.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));

        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        try {
            Path uploadsDir = Paths.get("uploads");
            if (!Files.exists(uploadsDir)) Files.createDirectories(uploadsDir);

            String original = file.getOriginalFilename();
            String ext = (original != null && original.contains("."))
                    ? original.substring(original.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + ext;
            Path dest = uploadsDir.resolve(filename);
            file.transferTo(dest);

            user.setProfileImageUrl("/uploads/" + filename);
            userRepository.save(user);

            Map<String, String> resp = new HashMap<>();
            resp.put("profileImageUrl", "http://localhost:8080/uploads/" + filename);
            return ResponseEntity.ok(resp);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }

    // ─── USER: Change own password ────────────────────────────────────────────
    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> req, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        String currentPassword = req.get("currentPassword");
        String newPassword     = req.get("newPassword");

        if (currentPassword == null || newPassword == null)
            return ResponseEntity.badRequest().body(Map.of("message", "Both currentPassword and newPassword are required"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            return ResponseEntity.status(400).body(Map.of("message", "Current password is incorrect"));

        if (newPassword.length() < 8)
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 8 characters"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // ─── USER: Get own profile (me) ───────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(toDto(user));
    }
}
