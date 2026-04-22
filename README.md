# University Cyber & Ethical System

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Java JDK | 17 or 21 | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org |
| Node.js | 16–20 | https://nodejs.org |
| MongoDB | 6+ | https://www.mongodb.com/try/download/community |

---

## Step 1 — Start MongoDB

**Windows:**
```
net start MongoDB
```
Or open **MongoDB Compass** and connect to `mongodb://localhost:27017`

**Mac/Linux:**
```bash
brew services start mongodb-community
# OR
sudo systemctl start mongod
```

---

## Step 2 — Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

✅ You should see: `Started CyberSystemApplication`

### If Maven build fails:
```bash
# Skip tests (no MongoDB needed at build time)
mvn spring-boot:run -DskipTests
```

---

## Step 3 — Run Frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts at: **http://localhost:3000**

### If npm start fails with "digital envelope routines" error (Node 17+):

**Windows:**
```cmd
set NODE_OPTIONS=--openssl-legacy-provider
npm start
```

**Mac/Linux:**
```bash
export NODE_OPTIONS=--openssl-legacy-provider
npm start
```

Or just run:
```bash
npm run start:mac    # Mac/Linux
npm run start:legacy # Windows
```

---

## Default Login Credentials

After first run, register a user at `/register`.  
For admin access, set `role: "ADMIN"` in MongoDB:
```
Database: university_cyber_db
Collection: users
```

---

## Common Errors & Fixes

### ❌ `Connection refused: localhost:27017`
→ MongoDB is not running. Start it (Step 1).

### ❌ `digital envelope routines::unsupported`
→ Node.js version too new. Use `npm run start:mac` or `npm run start:legacy`.

### ❌ `Port 8080 already in use`
→ Change port in `backend/src/main/resources/application.properties`:
```properties
server.port=8081
```
Then update `frontend/src/services/api.js` line 3:
```js
const BASE_URL = 'http://localhost:8081/api';
```

### ❌ `CORS error` in browser
→ Backend is not running or wrong port. Make sure backend is on port 8080.

### ❌ Lombok errors / cannot find symbol
→ Make sure you're using Java 17+:
```bash
java -version
mvn -version
```

---

## Project Structure

```
university-cyber-ethical-final/
├── backend/                    ← Spring Boot (Java 17, Maven)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/university/cybersystem/
│       │   ├── controller/     ← REST APIs
│       │   ├── model/          ← MongoDB documents
│       │   ├── repository/     ← Data access
│       │   ├── security/       ← JWT auth
│       │   └── config/         ← CORS, Security config
│       └── resources/
│           └── application.properties
│
└── frontend/                   ← React 18, Tailwind CSS
    ├── package.json
    ├── .env
    └── src/
        ├── services/api.js     ← All backend API calls
        ├── context/AuthContext.jsx
        └── pages/              ← All page components
```
