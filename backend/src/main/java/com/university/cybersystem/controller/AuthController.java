package com.university.cybersystem.controller;

import com.university.cybersystem.model.User;
import com.university.cybersystem.repository.UserRepository;
import com.university.cybersystem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.Base64;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> req) {
        String email           = req.get("email");
        String name            = req.get("name");
        String pass            = req.get("password");
        String role            = req.getOrDefault("role", "USER");
        String phone           = req.get("phone");
        String department      = req.get("department");
        String profileImageData = req.get("profileImageData");

        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        if (userRepository.existsByEmail(email))
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(pass));
        user.setRole(role.toUpperCase());
        user.setPhone(phone);
        user.setDepartment(department);
        user.setStudentId("STU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        if (profileImageData != null && !profileImageData.isBlank()) {
            try {
                String base64 = profileImageData;
                if (base64.contains(",")) base64 = base64.substring(base64.indexOf(",") + 1);
                byte[] decoded = Base64.getDecoder().decode(base64);
                String ext = "png";
                if (profileImageData.startsWith("data:image/")) {
                    int s = profileImageData.indexOf("/") + 1;
                    int e = profileImageData.indexOf(";");
                    if (s > 0 && e > s) ext = profileImageData.substring(s, e);
                }
                String filename = UUID.randomUUID().toString() + "." + ext;
                Path uploadsDir = Paths.get("uploads");
                if (!Files.exists(uploadsDir)) Files.createDirectories(uploadsDir);
                Files.write(uploadsDir.resolve(filename), decoded);
                user.setProfileImageUrl("/uploads/" + filename);
            } catch (Exception ex) {
                // ignore image save failure
            }
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        String pass  = req.get("password");

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null || !passwordEncoder.matches(pass, user.getPassword()))
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id",         user.getId());
        userInfo.put("name",       user.getName());
        userInfo.put("email",      user.getEmail());
        userInfo.put("role",       user.getRole());
        userInfo.put("phone",      user.getPhone());
        userInfo.put("department", user.getDepartment());
        userInfo.put("studentId",  user.getStudentId());

        String profileUrl = user.getProfileImageUrl();
        if (profileUrl != null && profileUrl.startsWith("/"))
            profileUrl = "http://localhost:8080" + profileUrl;
        else if (profileUrl != null && !profileUrl.startsWith("http"))
            profileUrl = "http://localhost:8080/" + profileUrl.replaceAll("^/+", "");
        userInfo.put("profileImageUrl", profileUrl);

        return ResponseEntity.ok(Map.of("token", token, "user", userInfo));
    }
}
