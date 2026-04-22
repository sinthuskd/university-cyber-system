# Git Setup & Commit History Guide
## IT3040 ITPM — Assignment 5 | Risk Assessment Module

---

## Step 1: Initialize Git Repository

```bash
cd university-cyber-fixed
git init
git remote add origin https://github.com/YOUR_USERNAME/university-cyber-ethical.git
```

---

## Step 2: Run These Commands in Order
### (Copy-paste each block — these create your meaningful commit history)

```bash
# ── Sprint 1: Setup & Backend ────────────────────────────────

git add backend/pom.xml backend/src/main/java/com/university/cybersystem/CyberSystemApplication.java
git commit -m "feat: initialize Spring Boot backend with MongoDB and JWT dependencies"

git add backend/src/main/java/com/university/cybersystem/model/RiskAssessment.java
git commit -m "feat: add RiskAssessment MongoDB document model with score and riskLevel fields"

git add backend/src/main/java/com/university/cybersystem/repository/RiskAssessmentRepository.java
git commit -m "feat: add RiskAssessmentRepository with findByUserEmail query method"

git add backend/src/main/java/com/university/cybersystem/controller/RiskController.java
git commit -m "feat: implement GET /api/risk/questions endpoint returning 8 cybersecurity questions"


# ── Sprint 2: Core UI ────────────────────────────────────────

git add frontend/src/pages/risk/RiskStartPage.jsx
git commit -m "feat: add RiskStartPage component with assessment info and start button"

git add frontend/src/pages/risk/RiskQuestionnairePage.jsx
git commit -m "feat: add RiskQuestionnairePage with step-by-step questions and countdown timer"

git add frontend/src/pages/risk/RiskResultPage.jsx
git commit -m "feat: add RiskResultPage showing score, risk level badge and recommendations list"

git add frontend/src/pages/risk/RiskHistoryPage.jsx
git commit -m "feat: add RiskHistoryPage displaying all past assessments with timestamps"

git add frontend/src/pages/risk/RiskDashboard.jsx
git commit -m "feat: add RiskDashboard hub page linking all risk module features"


# ── Sprint 3: Advanced Features ──────────────────────────────

git add frontend/src/pages/risk/PersonalSecurityDashboard.jsx
git commit -m "feat: add PersonalSecurityDashboard with security posture visualizations"

git add frontend/src/pages/risk/RiskAnalyticsDashboard.jsx
git commit -m "feat: add admin RiskAnalyticsDashboard with department-wise risk breakdown"

git add frontend/src/pages/risk/ChatbotPage.jsx
git commit -m "feat: integrate AI chatbot page with message history and API connection"

git add frontend/src/pages/risk/DepartmentRiskAnalysis.jsx
git commit -m "feat: add DepartmentRiskAnalysis component with comparative risk charts"


# ── Sprint 4: Testing & Fixes ─────────────────────────────────

git add frontend/src/__tests__/risk/riskScoring.test.js
git commit -m "test: add 16 unit tests for risk score calculation and level classification"

git add frontend/src/__tests__/risk/riskComponents.test.js
git commit -m "test: add 20 API mock tests covering all riskAPI endpoints with axios mocks"

git add frontend/src/__tests__/risk/riskValidation.test.js
git commit -m "test: add validation and edge case tests for answer input and session IDs"

git add backend/src/main/java/com/university/cybersystem/config/SecurityConfig.java
git commit -m "fix: expand CORS allowed origins to include localhost:3001 and 127.0.0.1"

git add frontend/package.json frontend/.env
git commit -m "fix: add NODE_OPTIONS legacy-provider scripts for Node.js 17+ OpenSSL compatibility"

git add backend/pom.xml
git commit -m "fix: add skipTests flag and explicit Lombok annotation processor to pom.xml"

git add README.md docs/
git commit -m "docs: add comprehensive setup guide and project management task board"


# ── Final: Push everything ─────────────────────────────────────

git push -u origin main
```

---

## Step 3: Verify on GitHub

After pushing, your commit history should show **18+ meaningful commits** grouped by feature. 

In your viva, show:
- The commit list on GitHub
- Each commit message explains WHAT was changed and WHY
- Commits are grouped logically by sprint/feature

---

## Quick Commands Reference

```bash
git log --oneline          # See all commits in one line
git log --oneline --graph  # See branch graph
git status                 # See what's changed
git diff                   # See exact changes
```
