package com.university.cybersystem.controller;

import com.university.cybersystem.model.*;
import com.university.cybersystem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/awareness")
@RequiredArgsConstructor
public class AwarenessController {

    private final AwarenessArticleRepository articleRepository;
    private final QuizRepository quizRepository;
    private final QuizResultRepository quizResultRepository;
    private final ContentReachRepository contentReachRepository;
    private final UserRepository userRepository;
    private final TrainingVideoRepository videoRepository;

    private static final String UPLOAD_DIR = "uploads";

    // ── Articles ──────────────────────────────────────────────────────────────

    @GetMapping("/articles")
    public ResponseEntity<List<AwarenessArticle>> getArticles() {
        return ResponseEntity.ok(articleRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/articles/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable String id) {
        return articleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/articles")
    public ResponseEntity<?> createArticle(@RequestBody AwarenessArticle article, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        article.setAuthorId(user.getId());
        article.setAuthorName(user.getName());
        article.setCreatedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(articleRepository.save(article));
    }

    @PutMapping("/articles/{id}")
    public ResponseEntity<?> updateArticle(@PathVariable String id, @RequestBody AwarenessArticle updated) {
        return articleRepository.findById(id).map(a -> {
            a.setTitle(updated.getTitle());
            a.setContent(updated.getContent());
            a.setCategory(updated.getCategory());
            if (updated.getImageUrl() != null) a.setImageUrl(updated.getImageUrl());
            a.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(articleRepository.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/articles/{id}")
    public ResponseEntity<?> deleteArticle(@PathVariable String id) {
        if (!articleRepository.existsById(id)) return ResponseEntity.notFound().build();
        articleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Article deleted"));
    }

    // ── Article Image Upload ──────────────────────────────────────────────────

    @PostMapping("/articles/{id}/image")
    public ResponseEntity<?> uploadArticleImage(
            @PathVariable String id,
            @RequestParam("image") MultipartFile image) {
        return articleRepository.findById(id).map(article -> {
            try {
                Path uploadsDir = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadsDir)) Files.createDirectories(uploadsDir);
                String original = image.getOriginalFilename();
                String ext = (original != null && original.contains("."))
                        ? original.substring(original.lastIndexOf(".")) : ".jpg";
                String filename = "article_" + UUID.randomUUID() + ext;
                Path dest = uploadsDir.resolve(filename);
                image.transferTo(dest);
                article.setImageUrl("/uploads/" + filename);
                article.setUpdatedAt(LocalDateTime.now());
                AwarenessArticle saved = articleRepository.save(article);
                return ResponseEntity.ok(Map.of("imageUrl", saved.getImageUrl()));
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of("message", "Image upload failed: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Article Attachment Upload ─────────────────────────────────────────────

    @PostMapping("/articles/{id}/attachments")
    public ResponseEntity<?> uploadArticleAttachments(
            @PathVariable String id,
            @RequestParam("files") List<MultipartFile> files) {
        return articleRepository.findById(id).map(article -> {
            try {
                Path uploadsDir = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadsDir)) Files.createDirectories(uploadsDir);
                for (MultipartFile file : files) {
                    if (file.isEmpty()) continue;
                    String original = file.getOriginalFilename();
                    String ext = (original != null && original.contains("."))
                            ? original.substring(original.lastIndexOf(".")) : "";
                    String filename = "attach_" + UUID.randomUUID() + ext;
                    Path dest = uploadsDir.resolve(filename);
                    file.transferTo(dest);
                    article.getAttachments().add("/uploads/" + filename);
                }
                article.setUpdatedAt(LocalDateTime.now());
                return ResponseEntity.ok(articleRepository.save(article));
            } catch (IOException e) {
                return ResponseEntity.status(500).body(Map.of("message", "Upload failed: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Article / Video Reach Tracking ────────────────────────────────────────

    @PostMapping("/articles/{id}/view")
    public ResponseEntity<?> trackArticleView(@PathVariable String id, Authentication auth) {
        articleRepository.findById(id).ifPresent(article -> {
            User user = userRepository.findByEmail(auth.getName()).orElse(null);
            if (user != null) {
                // Only track unique views per user per article
                if (contentReachRepository.countByContentIdAndUserId(id, user.getId()) == 0) {
                    ContentReach reach = new ContentReach();
                    reach.setContentId(id);
                    reach.setContentType("ARTICLE");
                    reach.setContentTitle(article.getTitle());
                    reach.setUserId(user.getId());
                    reach.setUserName(user.getName());
                    reach.setUserEmail(user.getEmail());
                    reach.setViewedAt(LocalDateTime.now());
                    contentReachRepository.save(reach);
                }
            }
        });
        return ResponseEntity.ok(Map.of("message", "tracked"));
    }

    @PostMapping("/videos/{id}/view")
    public ResponseEntity<?> trackVideoView(@PathVariable String id, Authentication auth) {
        videoRepository.findById(id).ifPresent(video -> {
            User user = userRepository.findByEmail(auth.getName()).orElse(null);
            if (user != null) {
                if (contentReachRepository.countByContentIdAndUserId(id, user.getId()) == 0) {
                    ContentReach reach = new ContentReach();
                    reach.setContentId(id);
                    reach.setContentType("VIDEO");
                    reach.setContentTitle(video.getTitle());
                    reach.setUserId(user.getId());
                    reach.setUserName(user.getName());
                    reach.setUserEmail(user.getEmail());
                    reach.setViewedAt(LocalDateTime.now());
                    contentReachRepository.save(reach);
                }
            }
        });
        return ResponseEntity.ok(Map.of("message", "tracked"));
    }

    @GetMapping("/articles/{id}/reach")
    public ResponseEntity<?> getArticleReach(@PathVariable String id) {
        List<ContentReach> viewers = contentReachRepository.findByContentIdOrderByViewedAtDesc(id);
        return ResponseEntity.ok(Map.of(
                "contentId", id,
                "viewCount", viewers.size(),
                "viewers", viewers
        ));
    }

    @GetMapping("/videos/{id}/reach")
    public ResponseEntity<?> getVideoReach(@PathVariable String id) {
        List<ContentReach> viewers = contentReachRepository.findByContentIdOrderByViewedAtDesc(id);
        return ResponseEntity.ok(Map.of(
                "contentId", id,
                "viewCount", viewers.size(),
                "viewers", viewers
        ));
    }

    // ── Quizzes ───────────────────────────────────────────────────────────────

    @GetMapping("/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzes() {
        return ResponseEntity.ok(quizRepository.findAll());
    }

    @PostMapping("/quizzes")
    public ResponseEntity<?> createQuiz(@RequestBody Quiz quiz) {
        quiz.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(quizRepository.save(quiz));
    }

    @PutMapping("/quizzes/{id}")
    public ResponseEntity<?> updateQuiz(@PathVariable String id, @RequestBody Quiz updated) {
        return quizRepository.findById(id).map(q -> {
            q.setTitle(updated.getTitle());
            q.setDescription(updated.getDescription());
            q.setTimeLimitMinutes(updated.getTimeLimitMinutes());
            q.setQuestions(updated.getQuestions());
            return ResponseEntity.ok(quizRepository.save(q));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/quizzes/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable String id) {
        if (!quizRepository.existsById(id)) return ResponseEntity.notFound().build();
        quizRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Quiz deleted"));
    }

    @PostMapping("/quizzes/{id}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable String id,
                                        @RequestBody Map<String, Object> body,
                                        Authentication auth) {
        return quizRepository.findById(id).map(quiz -> {
            @SuppressWarnings("unchecked")
            Map<String, Integer> answers = (Map<String, Integer>) body.get("answers");
            Number durationSecsNum = (Number) body.get("durationSeconds");
            long durationSeconds = durationSecsNum != null ? durationSecsNum.longValue() : 0L;

            int correct = 0;
            int total = quiz.getQuestions().size();
            for (int idx = 0; idx < total; idx++) {
                Integer given = answers.get(String.valueOf(idx));
                if (given != null && given == quiz.getQuestions().get(idx).getCorrectAnswer()) {
                    correct++;
                }
            }
            int score = total == 0 ? 0 : (correct * 100) / total;
            boolean passed = score >= 70;
            final int correctFinal = correct;

            // Persist result
            if (auth != null) {
                userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                    QuizResult result = new QuizResult();
                    result.setQuizId(quiz.getId());
                    result.setQuizTitle(quiz.getTitle());
                    result.setUserId(user.getId());
                    result.setUserName(user.getName());
                    result.setUserEmail(user.getEmail());
                    result.setUserDepartment(user.getDepartment());
                    result.setScore(score);
                    result.setCorrect(correctFinal);
                    result.setTotal(total);
                    result.setPassed(passed);
                    result.setDurationSeconds(durationSeconds);
                    result.setSubmittedAt(LocalDateTime.now());
                    quizResultRepository.save(result);
                });
            }

            return ResponseEntity.ok(Map.of(
                    "score", score, "correct", correct, "total", total,
                    "passed", passed, "quizTitle", quiz.getTitle()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Quiz Results (user) ───────────────────────────────────────────────────

    @GetMapping("/quizzes/my-results")
    public ResponseEntity<?> getMyQuizResults(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        List<QuizResult> results = quizResultRepository.findByUserIdOrderBySubmittedAtDesc(user.getId());
        return ResponseEntity.ok(results);
    }

    // ── Quiz Results (admin) ──────────────────────────────────────────────────

    @GetMapping("/admin/quiz-results")
    public ResponseEntity<?> getAllQuizResults() {
        List<QuizResult> results = quizResultRepository.findAllByOrderBySubmittedAtDesc();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/admin/quiz-results/{quizId}")
    public ResponseEntity<?> getQuizResultsByQuiz(@PathVariable String quizId) {
        List<QuizResult> results = quizResultRepository.findByQuizIdOrderBySubmittedAtDesc(quizId);
        return ResponseEntity.ok(results);
    }

    // ── Admin Reach Summary ───────────────────────────────────────────────────

    @GetMapping("/admin/reach-summary")
    public ResponseEntity<?> getReachSummary() {
        List<ContentReach> all = contentReachRepository.findAllByOrderByViewedAtDesc();
        long articleViews = all.stream().filter(r -> "ARTICLE".equals(r.getContentType())).count();
        long videoViews   = all.stream().filter(r -> "VIDEO".equals(r.getContentType())).count();

        // Top articles by view count
        Map<String, Long> articleCounts = all.stream()
                .filter(r -> "ARTICLE".equals(r.getContentType()))
                .collect(Collectors.groupingBy(ContentReach::getContentTitle, Collectors.counting()));

        Map<String, Long> videoCounts = all.stream()
                .filter(r -> "VIDEO".equals(r.getContentType()))
                .collect(Collectors.groupingBy(ContentReach::getContentTitle, Collectors.counting()));

        return ResponseEntity.ok(Map.of(
                "totalArticleViews", articleViews,
                "totalVideoViews", videoViews,
                "articleViewCounts", articleCounts,
                "videoViewCounts", videoCounts,
                "recentViews", all.stream().limit(50).collect(Collectors.toList())
        ));
    }

    // ── Awareness Progress Report ─────────────────────────────────────────────

    @GetMapping("/report")
    public ResponseEntity<byte[]> generateReport(Authentication auth) {
        List<AwarenessArticle> articles = articleRepository.findAllByOrderByCreatedAtDesc();
        List<Quiz> quizzes = quizRepository.findAll();
        List<QuizResult> quizResults = quizResultRepository.findAllByOrderBySubmittedAtDesc();
        List<ContentReach> reaches = contentReachRepository.findAllByOrderByViewedAtDesc();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");
        String now = LocalDateTime.now().format(fmt);

        long articleViews = reaches.stream().filter(r -> "ARTICLE".equals(r.getContentType())).count();
        long videoViews   = reaches.stream().filter(r -> "VIDEO".equals(r.getContentType())).count();
        long passed       = quizResults.stream().filter(QuizResult::isPassed).count();
        double avgScore   = quizResults.isEmpty() ? 0 :
                quizResults.stream().mapToInt(QuizResult::getScore).average().orElse(0);

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head>")
            .append("<meta charset='UTF-8'>")
            .append("<title>Awareness Report</title>")
            .append("<style>")
            .append("body{font-family:Arial,sans-serif;margin:40px;color:#1e293b;background:#fff;}")
            .append("h1{color:#1e3a5f;border-bottom:3px solid #3b82f6;padding-bottom:8px;}")
            .append("h2{color:#1e3a5f;margin-top:32px;font-size:1.1rem;}")
            .append("table{width:100%;border-collapse:collapse;margin-top:12px;}")
            .append("th{background:#1e3a5f;color:#fff;padding:10px 12px;text-align:left;font-size:0.85rem;}")
            .append("td{padding:9px 12px;font-size:0.85rem;border-bottom:1px solid #e2e8f0;}")
            .append("tr:nth-child(even){background:#f8fafc;}")
            .append(".badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.75rem;background:#dbeafe;color:#1d4ed8;}")
            .append(".pass{color:#16a34a;font-weight:600;}.fail{color:#dc2626;font-weight:600;}")
            .append(".summary{display:flex;gap:20px;margin:20px 0;flex-wrap:wrap;}")
            .append(".stat{background:#f1f5f9;border-radius:8px;padding:16px 24px;text-align:center;min-width:120px;}")
            .append(".stat-num{font-size:1.8rem;font-weight:700;color:#3b82f6;}")
            .append(".stat-lbl{font-size:0.8rem;color:#64748b;margin-top:4px;}")
            .append(".footer{margin-top:40px;font-size:0.75rem;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;}")
            .append("</style></head><body>");

        html.append("<h1>🛡️ Cyber Awareness Report</h1>");
        html.append("<p>Generated on: <strong>").append(now).append("</strong></p>");

        // Summary stats
        html.append("<div class='summary'>")
            .append("<div class='stat'><div class='stat-num'>").append(articles.size()).append("</div><div class='stat-lbl'>Articles</div></div>")
            .append("<div class='stat'><div class='stat-num'>").append(quizzes.size()).append("</div><div class='stat-lbl'>Quizzes</div></div>")
            .append("<div class='stat'><div class='stat-num'>").append(quizResults.size()).append("</div><div class='stat-lbl'>Quiz Attempts</div></div>")
            .append("<div class='stat'><div class='stat-num'>").append(passed).append("</div><div class='stat-lbl'>Passed</div></div>")
            .append("<div class='stat'><div class='stat-num'>").append(String.format("%.0f%%", avgScore)).append("</div><div class='stat-lbl'>Avg Score</div></div>")
            .append("<div class='stat'><div class='stat-num'>").append(articleViews).append("</div><div class='stat-lbl'>Article Views</div></div>")
            .append("<div class='stat'><div class='stat-num'>").append(videoViews).append("</div><div class='stat-lbl'>Video Views</div></div>")
            .append("</div>");

        // Articles
        html.append("<h2>📄 Awareness Articles</h2>");
        html.append("<table><thead><tr><th>#</th><th>Title</th><th>Category</th><th>Author</th><th>Views</th><th>Created</th></tr></thead><tbody>");
        int i = 1;
        Map<String, Long> articleViewMap = reaches.stream()
                .filter(r -> "ARTICLE".equals(r.getContentType()))
                .collect(Collectors.groupingBy(ContentReach::getContentId, Collectors.counting()));
        for (AwarenessArticle a : articles) {
            html.append("<tr>")
                .append("<td>").append(i++).append("</td>")
                .append("<td><strong>").append(escapeHtml(a.getTitle())).append("</strong></td>")
                .append("<td><span class='badge'>").append(a.getCategory() != null ? a.getCategory().replace("_"," ") : "General").append("</span></td>")
                .append("<td>").append(escapeHtml(a.getAuthorName() != null ? a.getAuthorName() : "-")).append("</td>")
                .append("<td>").append(articleViewMap.getOrDefault(a.getId(), 0L)).append("</td>")
                .append("<td>").append(a.getCreatedAt() != null ? a.getCreatedAt().format(fmt) : "-").append("</td>")
                .append("</tr>");
        }
        if (articles.isEmpty()) html.append("<tr><td colspan='6' style='text-align:center;color:#94a3b8;'>No articles found</td></tr>");
        html.append("</tbody></table>");

        // Quizzes
        html.append("<h2>❓ Quizzes</h2>");
        html.append("<table><thead><tr><th>#</th><th>Title</th><th>Questions</th><th>Time Limit</th><th>Attempts</th><th>Pass Rate</th></tr></thead><tbody>");
        int j = 1;
        for (Quiz q : quizzes) {
            List<QuizResult> qResults = quizResults.stream()
                    .filter(r -> q.getId().equals(r.getQuizId())).collect(Collectors.toList());
            long qPassed = qResults.stream().filter(QuizResult::isPassed).count();
            String passRate = qResults.isEmpty() ? "-" : String.format("%.0f%%", (qPassed * 100.0 / qResults.size()));
            html.append("<tr>")
                .append("<td>").append(j++).append("</td>")
                .append("<td><strong>").append(escapeHtml(q.getTitle())).append("</strong></td>")
                .append("<td>").append(q.getQuestions() != null ? q.getQuestions().size() : 0).append("</td>")
                .append("<td>").append(q.getTimeLimitMinutes() != null ? q.getTimeLimitMinutes() + " min" : "No limit").append("</td>")
                .append("<td>").append(qResults.size()).append("</td>")
                .append("<td>").append(passRate).append("</td>")
                .append("</tr>");
        }
        if (quizzes.isEmpty()) html.append("<tr><td colspan='6' style='text-align:center;color:#94a3b8;'>No quizzes found</td></tr>");
        html.append("</tbody></table>");

        // Quiz Results
        html.append("<h2>📊 All Quiz Results</h2>");
        html.append("<table><thead><tr><th>#</th><th>User</th><th>Email</th><th>Quiz</th><th>Score</th><th>Correct</th><th>Status</th><th>Date</th></tr></thead><tbody>");
        int k = 1;
        for (QuizResult r : quizResults.stream().limit(100).collect(Collectors.toList())) {
            html.append("<tr>")
                .append("<td>").append(k++).append("</td>")
                .append("<td>").append(escapeHtml(r.getUserName() != null ? r.getUserName() : "-")).append("</td>")
                .append("<td>").append(escapeHtml(r.getUserEmail() != null ? r.getUserEmail() : "-")).append("</td>")
                .append("<td>").append(escapeHtml(r.getQuizTitle() != null ? r.getQuizTitle() : "-")).append("</td>")
                .append("<td><strong>").append(r.getScore()).append("%</strong></td>")
                .append("<td>").append(r.getCorrect()).append("/").append(r.getTotal()).append("</td>")
                .append("<td class='").append(r.isPassed() ? "pass" : "fail").append("'>").append(r.isPassed() ? "✅ Passed" : "❌ Failed").append("</td>")
                .append("<td>").append(r.getSubmittedAt() != null ? r.getSubmittedAt().format(fmt) : "-").append("</td>")
                .append("</tr>");
        }
        if (quizResults.isEmpty()) html.append("<tr><td colspan='8' style='text-align:center;color:#94a3b8;'>No results yet</td></tr>");
        html.append("</tbody></table>");

        html.append("<div class='footer'>University Cyber &amp; Ethical Awareness System &mdash; Auto-generated report &mdash; ").append(now).append("</div>");
        html.append("</body></html>");

        byte[] bytes = html.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"awareness-report-"
                        + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")) + ".html\"")
                .contentType(MediaType.TEXT_HTML)
                .body(bytes);
    }

    private String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
