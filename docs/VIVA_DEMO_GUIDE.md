# Live Demo Guide — Risk Assessment Module
## IT3040 ITPM | Assignment 5 | 2.5 Minutes

---

## ⏱ 2.5 Minute Demo Script

### Minute 0:00–0:30 → Show Running System
1. Open browser → `http://localhost:3000`
2. Login with your credentials
3. Say: *"This is the University Cyber & Ethical System. I am responsible for the Risk Assessment module."*

### Minute 0:30–1:00 → Core Feature: Take Assessment
1. Click **Risk Assessment** in sidebar → Risk Dashboard loads
2. Click **"Begin Now"** → RiskStartPage shows (8 questions, ~5 min info)
3. Click **"Start Assessment Now"** → Questionnaire loads
4. Answer 3–4 questions quickly
5. Say: *"The questionnaire has a countdown timer — it auto-submits when time runs out."*

### Minute 1:00–1:30 → Results & Recommendations
1. Submit the assessment → RiskResultPage loads
2. Point to the score bar and risk level badge (LOW/MEDIUM/HIGH)
3. Show the recommendations list
4. Say: *"The system calculates a risk score out of 100 and gives personalised security recommendations."*

### Minute 1:30–2:00 → Testing Evidence
1. Open VS Code terminal
2. Run: `npm run test:risk`
3. Show tests passing — 3 test files, 40+ assertions
4. Say: *"I wrote Jest unit tests covering score calculation, API calls, and validation edge cases."*

### Minute 2:00–2:30 → Git & Project Management
1. Open GitHub → show commit history (18+ commits with meaningful messages)
2. Open GitHub Projects → show Kanban board with 4 sprints
3. Say: *"Every feature was tracked as a task, and commits follow a feat/fix/test convention."*

---

## 📋 Assessment Criteria Checklist

| Criteria | Evidence | Where to Show |
|----------|----------|---------------|
| ✅ Functionality complete | All 8 pages working | Live demo |
| ✅ Interface quality | Consistent dark theme, labels capitalized | Show dashboard |
| ✅ System integration | JWT auth, MongoDB, API calls working | Login → Risk flow |
| ✅ Git usage | 18+ meaningful commits | GitHub commit list |
| ✅ Project management | GitHub Projects Kanban board | GitHub Projects tab |
| ✅ Automated testing | 3 test files, 40+ tests, all passing | `npm run test:risk` |

---

## 🛠 Before the Demo — Checklist

- [ ] MongoDB is running (`mongod` or MongoDB Compass connected)
- [ ] Backend running: `cd backend && mvn spring-boot:run`
- [ ] Frontend running: `cd frontend && npm start`
- [ ] At least one user registered in the system
- [ ] `npm run test:risk` runs and passes on your laptop
- [ ] GitHub commits pushed and visible
- [ ] HDMI adapter ready if needed

---

## 🆘 If Something Goes Wrong

| Problem | Quick Fix |
|---------|-----------|
| Backend won't start | Run `mvn spring-boot:run -DskipTests` |
| Frontend build error | Run `npm run start:mac` (Mac) or `npm run start:legacy` (Windows) |
| Cannot connect to backend | Check MongoDB is running, then restart backend |
| CORS error in browser | Make sure backend is on port 8080 |
| Tests fail | Run `npm install` first, then `npm run test:risk` |
