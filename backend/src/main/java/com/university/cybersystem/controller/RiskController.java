package com.university.cybersystem.controller;

import com.university.cybersystem.model.ChatLog;
import com.university.cybersystem.model.RiskAssessment;
import com.university.cybersystem.model.User;
import com.university.cybersystem.repository.ChatLogRepository;
import com.university.cybersystem.repository.RiskAssessmentRepository;
import com.university.cybersystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    private final RiskAssessmentRepository riskRepository;
    private final UserRepository userRepository;
    private final ChatLogRepository chatLogRepository;

    // ── Predefined Questions (mutable so admin can update) ───────────────────

    private static final List<Map<String, Object>> QUESTIONS = new ArrayList<>(Arrays.asList(
        new HashMap<>(Map.of("question", "Do you use unique passwords for every account?",
               "options", new ArrayList<>(List.of("Yes, always", "Sometimes", "No, I reuse passwords", "I use a password manager")))),
        new HashMap<>(Map.of("question", "How often do you update your passwords?",
               "options", new ArrayList<>(List.of("Every month", "Every 3-6 months", "Once a year", "Never")))),
        new HashMap<>(Map.of("question", "Do you enable two-factor authentication (2FA)?",
               "options", new ArrayList<>(List.of("Yes, on all accounts", "Only on important accounts", "No", "I don't know what that is")))),
        new HashMap<>(Map.of("question", "How do you handle suspicious emails?",
               "options", new ArrayList<>(List.of("Delete without opening", "Report as phishing", "Open to check", "Click links to verify")))),
        new HashMap<>(Map.of("question", "Do you keep your software and OS updated?",
               "options", new ArrayList<>(List.of("Always, automatically", "Usually manually", "Sometimes", "Rarely")))),
        new HashMap<>(Map.of("question", "Do you use public Wi-Fi for sensitive activities?",
               "options", new ArrayList<>(List.of("Never", "Only with VPN", "Sometimes", "Yes, regularly")))),
        new HashMap<>(Map.of("question", "How do you store sensitive documents?",
               "options", new ArrayList<>(List.of("Encrypted cloud/drive", "Password-protected folder", "Regular folder", "No special storage")))),
        new HashMap<>(Map.of("question", "Do you have antivirus/security software installed?",
               "options", new ArrayList<>(List.of("Yes, updated regularly", "Yes, but outdated", "No, but planning to", "No"))))
    ));

    // ── Assessment CRUD ───────────────────────────────────────────────────────

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions() {
        return ResponseEntity.ok(QUESTIONS);
    }

    @SuppressWarnings("unchecked")
    @PutMapping("/questions")
    public ResponseEntity<?> updateQuestions(@RequestBody Map<String, Object> body) {
        List<Map<String, Object>> incoming = (List<Map<String, Object>>) body.get("questions");
        if (incoming == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "questions field is required"));
        }
        QUESTIONS.clear();
        for (Map<String, Object> q : incoming) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("question", q.get("question"));
            List<String> opts = (List<String>) q.get("options");
            entry.put("options", opts != null ? new ArrayList<>(opts) : new ArrayList<>());
            QUESTIONS.add(entry);
        }
        return ResponseEntity.ok(Map.of("message", "Questions updated", "count", QUESTIONS.size()));
    }

    @PostMapping("/start")
    public ResponseEntity<?> startAssessment() {
        String sessionId = UUID.randomUUID().toString();
        return ResponseEntity.ok(Map.of("sessionId", sessionId));
    }

    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<?> submitAnswers(@PathVariable String sessionId,
                                            @RequestBody Map<String, Object> body,
                                            Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        @SuppressWarnings("unchecked")
        Map<String, Integer> answers = (Map<String, Integer>) body.get("answers");

        int riskPoints = 0;
        int total = QUESTIONS.size();
        for (int i = 0; i < total; i++) {
            Integer given = answers.get(String.valueOf(i));
            if (given != null) riskPoints += given;
        }

        int maxRisk = total * 3;
        int score = (riskPoints * 100) / maxRisk;
        String riskLevel = score < 30 ? "LOW" : score < 60 ? "MEDIUM" : "HIGH";

        List<String> recommendations = generateRecommendations(answers, riskLevel);

        RiskAssessment assessment = new RiskAssessment();
        assessment.setSessionId(sessionId);
        assessment.setUserId(user.getId());
        assessment.setAnswers(answers);
        assessment.setScore(score);
        assessment.setRiskLevel(riskLevel);
        assessment.setRecommendations(recommendations);
        assessment.setCompletedAt(LocalDateTime.now());

        return ResponseEntity.ok(riskRepository.save(assessment));
    }

    @GetMapping("/{sessionId}/result")
    public ResponseEntity<?> getResult(@PathVariable String sessionId) {
        return riskRepository.findBySessionId(sessionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(riskRepository.findByUserIdOrderByCompletedAtDesc(user.getId()));
    }

    @GetMapping("/assessments/all")
    public ResponseEntity<?> getAllAssessments() {
        List<RiskAssessment> all = riskRepository.findAll();
        all.sort(Comparator.comparing(RiskAssessment::getCompletedAt).reversed());

        List<Map<String, Object>> result = all.stream().map(r -> {
            Map<String, Object> item = new java.util.LinkedHashMap<>();
            item.put("id", r.getId());
            item.put("sessionId", r.getSessionId());
            item.put("userId", r.getUserId());

            // Enrich with userName from UserRepository
            String name = userRepository.findById(r.getUserId())
                .map(u -> u.getName() != null ? u.getName() : u.getEmail())
                .orElse("Unknown");
            item.put("userName", name);

            item.put("score", r.getScore());
            item.put("riskLevel", r.getRiskLevel());
            item.put("answeredCount", r.getAnswers() != null ? r.getAnswers().size() : 0);
            item.put("totalQuestions", QUESTIONS.size());
            item.put("autoSubmitted", false);
            item.put("completedAt", r.getCompletedAt());
            item.put("recommendations", r.getRecommendations());
            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/assessment/{id}")
    public ResponseEntity<?> deleteAssessment(@PathVariable String id, Authentication auth) {
        riskRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    // ── Chatbot ───────────────────────────────────────────────────────────────

    @PostMapping("/chatbot")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> body) {
        String message = ((String) body.get("message")).toLowerCase();
        String reply = generateChatbotReply(message);
        return ResponseEntity.ok(Map.of("reply", reply));
    }

    // ── Chat Log CRUD ─────────────────────────────────────────────────────────

    @PostMapping("/chat-logs")
    public ResponseEntity<?> saveChatLog(@RequestBody Map<String, Object> body, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();

        ChatLog log = new ChatLog();
        log.setUserId(user.getId());
        log.setFirstMessage((String) body.get("firstMessage"));

        @SuppressWarnings("unchecked")
        List<Map<String, String>> messages = (List<Map<String, String>>) body.get("messages");
        log.setMessages(messages);
        log.setCreatedAt(LocalDateTime.now());

        return ResponseEntity.ok(chatLogRepository.save(log));
    }

    @GetMapping("/chat-logs")
    public ResponseEntity<?> getChatLogs(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(chatLogRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @DeleteMapping("/chat-logs/{id}")
    public ResponseEntity<?> deleteChatLog(@PathVariable String id, Authentication auth) {
        chatLogRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    @DeleteMapping("/chat-logs")
    public ResponseEntity<?> deleteAllChatLogs(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        chatLogRepository.deleteByUserId(user.getId());
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    // ── Admin Analytics ───────────────────────────────────────────────────────

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        List<RiskAssessment> all = riskRepository.findAll();

        long low    = all.stream().filter(r -> "LOW".equals(r.getRiskLevel())).count();
        long medium = all.stream().filter(r -> "MEDIUM".equals(r.getRiskLevel())).count();
        long high   = all.stream().filter(r -> "HIGH".equals(r.getRiskLevel())).count();
        int avg = all.isEmpty() ? 0 :
            (int) all.stream().mapToInt(RiskAssessment::getScore).average().orElse(0);

        List<RiskAssessment> recent = all.stream()
            .sorted(Comparator.comparing(RiskAssessment::getCompletedAt).reversed())
            .limit(10)
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "totalAssessments", all.size(),
            "lowCount", low,
            "mediumCount", medium,
            "highCount", high,
            "avgScore", avg,
            "recentAssessments", recent
        ));
    }

    @GetMapping("/analytics/departments")
    public ResponseEntity<?> getDepartmentAnalytics() {
        List<RiskAssessment> all = riskRepository.findAll();

        // Group assessments by user's department
        Map<String, List<RiskAssessment>> byDept = new LinkedHashMap<>();
        for (RiskAssessment r : all) {
            String dept = userRepository.findById(r.getUserId())
                .map(u -> u.getDepartment() != null && !u.getDepartment().isBlank() ? u.getDepartment() : "Unspecified")
                .orElse("Unspecified");
            byDept.computeIfAbsent(dept, k -> new ArrayList<>()).add(r);
        }

        List<Map<String, Object>> result = byDept.entrySet().stream().map(entry -> {
            String dept = entry.getKey();
            List<RiskAssessment> deptAssessments = entry.getValue();

            long lowCount    = deptAssessments.stream().filter(r -> "LOW".equals(r.getRiskLevel())).count();
            long mediumCount = deptAssessments.stream().filter(r -> "MEDIUM".equals(r.getRiskLevel())).count();
            long highCount   = deptAssessments.stream().filter(r -> "HIGH".equals(r.getRiskLevel())).count();
            int avgScore     = deptAssessments.isEmpty() ? 0 :
                (int) deptAssessments.stream().mapToInt(RiskAssessment::getScore).average().orElse(0);

            // Count distinct users in this department
            long totalUsers = deptAssessments.stream().map(RiskAssessment::getUserId).distinct().count();

            Map<String, Object> item = new java.util.LinkedHashMap<>();
            item.put("department", dept);
            item.put("totalUsers", totalUsers);
            item.put("totalAssessments", deptAssessments.size());
            item.put("avgScore", avgScore);
            item.put("lowCount", lowCount);
            item.put("mediumCount", mediumCount);
            item.put("highCount", highCount);
            return item;
        }).sorted(Comparator.comparingInt(m -> -((int) m.get("avgScore"))))
          .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // ── Report Generation ────────────────────────────────────────────────────

    @GetMapping("/report")
    public ResponseEntity<byte[]> generateReport(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<RiskAssessment> history = riskRepository.findByUserIdOrderByCompletedAtDesc(user.getId());

        StringBuilder csv = new StringBuilder();
        csv.append("Risk Assessment Report\n");
        csv.append("User: ").append(user.getEmail()).append("\n");
        csv.append("Generated: ").append(LocalDateTime.now()).append("\n\n");
        csv.append("Session ID,Score,Risk Level,Date,Recommendations\n");

        for (RiskAssessment r : history) {
            String recs = String.join("; ", r.getRecommendations() != null ? r.getRecommendations() : List.of());
            csv.append(r.getSessionId()).append(",")
               .append(r.getScore()).append(",")
               .append(r.getRiskLevel()).append(",")
               .append(r.getCompletedAt()).append(",")
               .append("\"").append(recs).append("\"").append("\n");
        }

        byte[] bytes = csv.toString().getBytes();
        return ResponseEntity.ok()
            .header("Content-Type", "text/csv")
            .header("Content-Disposition", "attachment; filename=risk-report.csv")
            .body(bytes);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private List<String> generateRecommendations(Map<String, Integer> answers, String riskLevel) {
        List<String> recs = new ArrayList<>();
        if (answers.getOrDefault("0", 0) > 1) recs.add("Use a password manager to generate and store unique passwords for each account.");
        if (answers.getOrDefault("1", 0) > 1) recs.add("Update your passwords every 3-6 months, especially for critical accounts.");
        if (answers.getOrDefault("2", 0) > 1) recs.add("Enable two-factor authentication (2FA) on all important accounts immediately.");
        if (answers.getOrDefault("3", 0) > 1) recs.add("Never click links in suspicious emails. Report phishing attempts to your IT department.");
        if (answers.getOrDefault("4", 0) > 1) recs.add("Enable automatic updates for your OS and applications to patch security vulnerabilities.");
        if (answers.getOrDefault("5", 0) > 1) recs.add("Avoid using public Wi-Fi for banking or sensitive activities. Use a VPN if necessary.");
        if (answers.getOrDefault("6", 0) > 1) recs.add("Store sensitive files in encrypted storage with password protection.");
        if (answers.getOrDefault("7", 0) > 1) recs.add("Install reputable antivirus software and keep it updated.");
        if (recs.isEmpty()) recs.add("Great job! Your cybersecurity practices are strong. Keep maintaining them.");
        return recs;
    }

    private String generateChatbotReply(String message) {
        if (message.contains("phishing") || message.contains("email scam"))
            return "🎣 Phishing is a cyber attack where attackers trick you into revealing sensitive info via fake emails or websites. Tips: Check sender email carefully, don't click suspicious links, verify with the sender through a separate channel, and report suspicious emails to your IT department.";
        if (message.contains("password"))
            return "🔐 Strong password tips: Use at least 12 characters, mix uppercase/lowercase/numbers/symbols, never reuse passwords, use a password manager like Bitwarden or LastPass, and enable 2FA wherever possible.";
        if (message.contains("malware") || message.contains("virus"))
            return "🦠 Malware protection tips: Keep antivirus updated, avoid downloading from unknown sources, don't open unexpected email attachments, keep your OS patched, and back up your data regularly.";
        if (message.contains("wifi") || message.contains("wi-fi") || message.contains("network"))
            return "📶 Network security tips: Avoid public Wi-Fi for sensitive tasks. If necessary, use a VPN. At home, use WPA3 encryption, change default router passwords, and keep firmware updated.";
        if (message.contains("2fa") || message.contains("two factor") || message.contains("authentication"))
            return "🔒 Two-Factor Authentication (2FA) adds an extra security layer beyond your password. Enable it on email, banking, and social accounts. Use authenticator apps like Google Authenticator or Microsoft Authenticator rather than SMS for stronger security.";
        if (message.contains("data breach") || message.contains("hack"))
            return "🚨 If you suspect a data breach: Change passwords immediately, enable 2FA, check haveibeenpwned.com to see if your email is compromised, monitor your accounts for unusual activity, and report to your university IT security team.";
        if (message.contains("ransomware"))
            return "💀 Ransomware encrypts your files and demands payment. Prevention: Keep regular backups offline, don't open suspicious attachments, keep software updated, and use endpoint protection. If infected, do NOT pay the ransom — report to authorities.";
        if (message.contains("vpn"))
            return "🛡️ A VPN (Virtual Private Network) encrypts your internet traffic and hides your IP address. It's especially useful on public Wi-Fi. Recommended for university use when accessing internal resources remotely.";
        if (message.contains("report") || message.contains("incident"))
            return "📋 To report a cyber incident at the university: Go to Incidents → Report Incident in the sidebar. Provide as many details as possible — type, time, affected systems. For academic violations, use Report Academic Violation. All reports are confidential.";
        if (message.contains("hello") || message.contains("hi") || message.contains("hey"))
            return "👋 Hello! I'm your Cyber Security AI Assistant. I can help you with:\n• Phishing & email scams\n• Password security\n• Malware & ransomware\n• Network & Wi-Fi safety\n• Two-factor authentication\n• How to report incidents\n\nWhat would you like to know?";
        return "🤔 I can help you with cybersecurity topics like phishing, passwords, malware, Wi-Fi safety, 2FA, data breaches, ransomware, VPNs, and reporting incidents. Please ask me about any of these topics!";
    }
}
