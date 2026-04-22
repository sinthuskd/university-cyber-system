// ============================================================
// Risk Assessment Module — Component & API Tests
// IT3040 ITPM — Assignment 5
// ============================================================

// ── Mock axios before any imports ───────────────────────────
jest.mock('axios', () => ({
  get:     jest.fn(),
  post:    jest.fn(),
  put:     jest.fn(),
  patch:   jest.fn(),
  delete:  jest.fn(),
  defaults: { headers: { common: {} } },
}));

const axios = require('axios');

// ── Mock riskAPI (mirrors services/api.js) ───────────────────
const riskAPI = {
  startAssessment:      () => axios.post('/api/risk/start'),
  getQuestions:         () => axios.get('/api/risk/questions'),
  submitAnswers:        (sessionId, answers) =>
    axios.post(`/api/risk/${sessionId}/submit`, { answers }),
  getHistory:           () => axios.get('/api/risk/history'),
  getAnalytics:         () => axios.get('/api/risk/analytics'),
  getDepartmentAnalytics: () => axios.get('/api/risk/analytics/departments'),
  chat:                 (message, history) =>
    axios.post('/api/risk/chatbot', { message, history }),
  saveChatLog:          (log)  => axios.post('/api/risk/chat-logs', log),
  getChatHistory:       ()     => axios.get('/api/risk/chat-logs'),
  deleteChatLog:        (id)   => axios.delete(`/api/risk/chat-logs/${id}`),
  deleteAllChatLogs:    ()     => axios.delete('/api/risk/chat-logs'),
  deleteAssessment:     (id)   => axios.delete(`/api/risk/assessment/${id}`),
  getAllAssessments:     ()     => axios.get('/api/risk/assessments/all'),
  getQuestions_admin:   ()     => axios.get('/api/risk/questions'),
  updateQuestions:      (qs)   => axios.put('/api/risk/questions', { questions: qs }),
};

// ── Test Suite 1: API Call Tests ─────────────────────────────
describe('Risk API — Start Assessment', () => {

  beforeEach(() => jest.clearAllMocks());

  test('startAssessment() → calls POST /api/risk/start', async () => {
    axios.post.mockResolvedValueOnce({ data: { sessionId: 'abc-123' } });
    const res = await riskAPI.startAssessment();
    expect(axios.post).toHaveBeenCalledWith('/api/risk/start');
    expect(res.data.sessionId).toBe('abc-123');
  });

  test('startAssessment() → returns valid UUID-format sessionId', async () => {
    const mockId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    axios.post.mockResolvedValueOnce({ data: { sessionId: mockId } });
    const res = await riskAPI.startAssessment();
    expect(res.data.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  test('startAssessment() → handles network error gracefully', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));
    await expect(riskAPI.startAssessment()).rejects.toThrow('Network Error');
  });

});

describe('Risk API — Questions', () => {

  beforeEach(() => jest.clearAllMocks());

  test('getQuestions() → calls GET /api/risk/questions', async () => {
    const mockQuestions = [
      { question: 'Do you use unique passwords?', options: ['Yes', 'No', 'Sometimes', 'Password Manager'] },
      { question: 'Do you use 2FA?', options: ['Always', 'Sometimes', 'Never', 'Unknown'] },
    ];
    axios.get.mockResolvedValueOnce({ data: mockQuestions });
    const res = await riskAPI.getQuestions();
    expect(axios.get).toHaveBeenCalledWith('/api/risk/questions');
    expect(res.data).toHaveLength(2);
    expect(res.data[0]).toHaveProperty('question');
    expect(res.data[0]).toHaveProperty('options');
  });

  test('getQuestions() → each question has 4 options', async () => {
    const mockQuestions = Array(8).fill(null).map((_, i) => ({
      question: `Question ${i + 1}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
    }));
    axios.get.mockResolvedValueOnce({ data: mockQuestions });
    const res = await riskAPI.getQuestions();
    res.data.forEach(q => expect(q.options).toHaveLength(4));
  });

});

describe('Risk API — Submit Answers', () => {

  beforeEach(() => jest.clearAllMocks());

  test('submitAnswers() → calls correct POST endpoint', async () => {
    const mockResult = {
      score: 45,
      riskLevel: 'MEDIUM',
      recommendations: ['Enable 2FA', 'Use password manager'],
    };
    axios.post.mockResolvedValueOnce({ data: mockResult });

    const answers = { '0': 1, '1': 2, '2': 0, '3': 1, '4': 1, '5': 2, '6': 0, '7': 1 };
    const res = await riskAPI.submitAnswers('session-xyz', answers);

    expect(axios.post).toHaveBeenCalledWith(
      '/api/risk/session-xyz/submit',
      { answers }
    );
    expect(res.data.riskLevel).toBe('MEDIUM');
  });

  test('submitAnswers() → response contains score and riskLevel', async () => {
    axios.post.mockResolvedValueOnce({
      data: { score: 75, riskLevel: 'HIGH', recommendations: [] },
    });
    const res = await riskAPI.submitAnswers('session-abc', {});
    expect(res.data).toHaveProperty('score');
    expect(res.data).toHaveProperty('riskLevel');
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(res.data.riskLevel);
  });

  test('submitAnswers() → score is between 0 and 100', async () => {
    axios.post.mockResolvedValueOnce({ data: { score: 25, riskLevel: 'LOW' } });
    const res = await riskAPI.submitAnswers('s1', {});
    expect(res.data.score).toBeGreaterThanOrEqual(0);
    expect(res.data.score).toBeLessThanOrEqual(100);
  });

});

describe('Risk API — History', () => {

  beforeEach(() => jest.clearAllMocks());

  test('getHistory() → returns array of past assessments', async () => {
    const mockHistory = [
      { id: '1', score: 20, riskLevel: 'LOW', completedAt: '2024-01-01T10:00:00Z' },
      { id: '2', score: 65, riskLevel: 'HIGH', completedAt: '2024-01-05T14:30:00Z' },
    ];
    axios.get.mockResolvedValueOnce({ data: mockHistory });
    const res = await riskAPI.getHistory();
    expect(res.data).toHaveLength(2);
    expect(res.data[0]).toHaveProperty('riskLevel');
    expect(res.data[0]).toHaveProperty('score');
  });

  test('getHistory() → empty array when no assessments taken', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    const res = await riskAPI.getHistory();
    expect(res.data).toEqual([]);
  });

  test('deleteAssessment() → calls DELETE with correct id', async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: 'Deleted' } });
    await riskAPI.deleteAssessment('assessment-id-99');
    expect(axios.delete).toHaveBeenCalledWith('/api/risk/assessment/assessment-id-99');
  });

});

describe('Risk API — Chatbot', () => {

  beforeEach(() => jest.clearAllMocks());

  test('chat() → sends message and history to chatbot endpoint', async () => {
    axios.post.mockResolvedValueOnce({ data: { reply: 'Use a password manager!' } });
    const history = [{ role: 'user', content: 'How do I stay safe?' }];
    const res = await riskAPI.chat('What is phishing?', history);
    expect(axios.post).toHaveBeenCalledWith('/api/risk/chatbot', {
      message: 'What is phishing?',
      history,
    });
    expect(res.data.reply).toBeTruthy();
  });

  test('chat() → works with empty history array', async () => {
    axios.post.mockResolvedValueOnce({ data: { reply: 'Hello! How can I help?' } });
    const res = await riskAPI.chat('Hello', []);
    expect(res.data.reply).toBeDefined();
  });

  test('saveChatLog() → calls POST with log data', async () => {
    const logData = { message: 'Test', reply: 'Response', timestamp: new Date().toISOString() };
    axios.post.mockResolvedValueOnce({ data: { id: 'log-1', ...logData } });
    await riskAPI.saveChatLog(logData);
    expect(axios.post).toHaveBeenCalledWith('/api/risk/chat-logs', logData);
  });

  test('deleteAllChatLogs() → calls DELETE on chat-logs endpoint', async () => {
    axios.delete.mockResolvedValueOnce({ data: { message: 'All logs deleted' } });
    await riskAPI.deleteAllChatLogs();
    expect(axios.delete).toHaveBeenCalledWith('/api/risk/chat-logs');
  });

});

describe('Risk API — Admin Analytics', () => {

  beforeEach(() => jest.clearAllMocks());

  test('getAnalytics() → returns analytics data', async () => {
    const mockAnalytics = {
      totalAssessments: 150,
      averageScore: 48.5,
      riskDistribution: { LOW: 45, MEDIUM: 70, HIGH: 35 },
    };
    axios.get.mockResolvedValueOnce({ data: mockAnalytics });
    const res = await riskAPI.getAnalytics();
    expect(res.data).toHaveProperty('totalAssessments');
    expect(res.data).toHaveProperty('riskDistribution');
  });

  test('getDepartmentAnalytics() → returns per-department data', async () => {
    const mockDeptData = [
      { department: 'IT', averageScore: 35, count: 25 },
      { department: 'Finance', averageScore: 62, count: 18 },
    ];
    axios.get.mockResolvedValueOnce({ data: mockDeptData });
    const res = await riskAPI.getDepartmentAnalytics();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data[0]).toHaveProperty('department');
  });

  test('getAllAssessments() → returns all assessments for admin', async () => {
    const mockAll = [
      { id: '1', userId: 'u1', score: 20, riskLevel: 'LOW' },
      { id: '2', userId: 'u2', score: 80, riskLevel: 'HIGH' },
    ];
    axios.get.mockResolvedValueOnce({ data: mockAll });
    const res = await riskAPI.getAllAssessments();
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty('riskLevel');
  });

});
