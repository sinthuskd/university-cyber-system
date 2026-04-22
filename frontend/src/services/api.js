import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

export const incidentAPI = {
  create: (data) => axios.post(`${BASE_URL}/incidents`, data),
  createAcademic: (data) => axios.post(`${BASE_URL}/incidents/academic`, data),
  getAll: () => axios.get(`${BASE_URL}/incidents`),
  getById: (id) => axios.get(`${BASE_URL}/incidents/${id}`),
  getMyHistory: () => axios.get(`${BASE_URL}/incidents/my`),
  update: (id, data) => axios.put(`${BASE_URL}/incidents/${id}`, data),
  updateStatus: (id, status) => axios.patch(`${BASE_URL}/incidents/${id}/status`, { status }),
  addNote: (id, note) => axios.post(`${BASE_URL}/incidents/${id}/notes`, { note }),
  delete: (id) => axios.delete(`${BASE_URL}/incidents/${id}`),
  uploadEvidence: (id, formData) =>
    axios.post(`${BASE_URL}/incidents/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const awarenessAPI = {
  // Articles CRUD
  getArticles: () => axios.get(`${BASE_URL}/awareness/articles`),
  getArticleById: (id) => axios.get(`${BASE_URL}/awareness/articles/${id}`),
  createArticle: (data) => axios.post(`${BASE_URL}/awareness/articles`, data),
  updateArticle: (id, data) => axios.put(`${BASE_URL}/awareness/articles/${id}`, data),
  deleteArticle: (id) => axios.delete(`${BASE_URL}/awareness/articles/${id}`),
  uploadArticleImage: (id, formData) =>
    axios.post(`${BASE_URL}/awareness/articles/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadArticleAttachments: (id, formData) =>
    axios.post(`${BASE_URL}/awareness/articles/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // Article reach tracking
  trackArticleView: (id) => axios.post(`${BASE_URL}/awareness/articles/${id}/view`),
  getArticleReach: (id) => axios.get(`${BASE_URL}/awareness/articles/${id}/reach`),

  // Quizzes CRUD
  getQuizzes: () => axios.get(`${BASE_URL}/awareness/quizzes`),
  createQuiz: (data) => axios.post(`${BASE_URL}/awareness/quizzes`, data),
  updateQuiz: (id, data) => axios.put(`${BASE_URL}/awareness/quizzes/${id}`, data),
  deleteQuiz: (id) => axios.delete(`${BASE_URL}/awareness/quizzes/${id}`),
  submitQuiz: (id, answers, durationSeconds) =>
    axios.post(`${BASE_URL}/awareness/quizzes/${id}/submit`, { answers, durationSeconds }),

  // Quiz results
  getMyQuizResults: () => axios.get(`${BASE_URL}/awareness/quizzes/my-results`),
  getAllQuizResults: () => axios.get(`${BASE_URL}/awareness/admin/quiz-results`),
  getQuizResultsByQuiz: (quizId) => axios.get(`${BASE_URL}/awareness/admin/quiz-results/${quizId}`),

  // Video reach tracking
  trackVideoView: (id) => axios.post(`${BASE_URL}/awareness/videos/${id}/view`),
  getVideoReach: (id) => axios.get(`${BASE_URL}/awareness/videos/${id}/reach`),

  // Admin reach summary
  getReachSummary: () => axios.get(`${BASE_URL}/awareness/admin/reach-summary`),

  // Report generation
  generateReport: () =>
    axios.get(`${BASE_URL}/awareness/report`, { responseType: 'blob' }),
};

export const trainingVideoAPI = {
  getAll: () => axios.get(`${BASE_URL}/awareness/videos`),
  getById: (id) => axios.get(`${BASE_URL}/awareness/videos/${id}`),
  getByCategory: (category) => axios.get(`${BASE_URL}/awareness/videos/category/${category}`),
  create: (data) => axios.post(`${BASE_URL}/awareness/videos`, data),
  update: (id, data) => axios.put(`${BASE_URL}/awareness/videos/${id}`, data),
  delete: (id) => axios.delete(`${BASE_URL}/awareness/videos/${id}`),
};

export const ethicalAPI = {
  // Cases CRUD
  getCases: () => axios.get(`${BASE_URL}/ethical`),
  getCaseById: (id) => axios.get(`${BASE_URL}/ethical/${id}`),
  createCase: (data) => axios.post(`${BASE_URL}/ethical`, data),
  updateDecision: (id, data) => axios.put(`${BASE_URL}/ethical/${id}/decision`, data),
  deleteCase: (id) => axios.delete(`${BASE_URL}/ethical/${id}`),
  // Appeals CRUD
  submitAppeal: (data) => axios.post(`${BASE_URL}/ethical/appeals`, data),
  getAppeals: () => axios.get(`${BASE_URL}/ethical/appeals`),
  updateAppealStatus: (id, status) => axios.patch(`${BASE_URL}/ethical/appeals/${id}`, { status }),
  deleteAppeal: (id) => axios.delete(`${BASE_URL}/ethical/${id}`),
};

export const riskAPI = {
  // Assessment CRUD
  startAssessment: () => axios.post(`${BASE_URL}/risk/start`),
  submitAnswers: (sessionId, answers) =>
    axios.post(`${BASE_URL}/risk/${sessionId}/submit`, { answers }),
  getResult: (sessionId) => axios.get(`${BASE_URL}/risk/${sessionId}/result`),
  getHistory: () => axios.get(`${BASE_URL}/risk/history`),
  deleteAssessment: (id) => axios.delete(`${BASE_URL}/risk/assessment/${id}`),

  // Questions CRUD
  getQuestions: () => axios.get(`${BASE_URL}/risk/questions`),
  updateQuestions: (questions) => axios.put(`${BASE_URL}/risk/questions`, { questions }),

  // Chatbot
  chat: (message, history) =>
    axios.post(`${BASE_URL}/risk/chatbot`, { message, history }),

  // Chat logs CRUD
  saveChatLog: (log) => axios.post(`${BASE_URL}/risk/chat-logs`, log),
  getChatHistory: () => axios.get(`${BASE_URL}/risk/chat-logs`),
  deleteChatLog: (id) => axios.delete(`${BASE_URL}/risk/chat-logs/${id}`),
  deleteAllChatLogs: () => axios.delete(`${BASE_URL}/risk/chat-logs`),

  // Admin analytics
  getAllAssessments: () => axios.get(`${BASE_URL}/risk/assessments/all`),
  getAnalytics: () => axios.get(`${BASE_URL}/risk/analytics`),
  getDepartmentAnalytics: () => axios.get(`${BASE_URL}/risk/analytics/departments`),

  // Report generation
  generateReport: () => axios.get(`${BASE_URL}/risk/report`, { responseType: 'blob' }),
};

export const userAPI = {
  getAll: () => axios.get(`${BASE_URL}/users`),
  getById: (id) => axios.get(`${BASE_URL}/users/${id}`),
  create: (data) => axios.post(`${BASE_URL}/users`, data),
  update: (id, data) => axios.put(`${BASE_URL}/users/${id}`, data),
  delete: (id) => axios.delete(`${BASE_URL}/users/${id}`),
  resetPassword: (id, newPassword) => axios.put(`${BASE_URL}/users/${id}/reset-password`, { newPassword }),
  updateProfile: (data) => axios.put(`${BASE_URL}/users/profile`, data),
  uploadProfileImage: (formData) => axios.post(`${BASE_URL}/users/profile-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => axios.put(`${BASE_URL}/users/password`, data),
};
