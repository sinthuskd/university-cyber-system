import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProfilePage from './pages/profile/ProfilePage';
import UserManagementPage from './pages/admin/UserManagementPage';

import IncidentReportPage from './pages/incidents/IncidentReportPage';
import AcademicViolationPage from './pages/incidents/AcademicViolationPage';
import IncidentListPage from './pages/incidents/IncidentListPage';
import IncidentDetailPage from './pages/incidents/IncidentDetailPage';
import IncidentHistoryPage from './pages/incidents/IncidentHistoryPage';
import EvidenceUploadPage from './pages/incidents/EvidenceUploadPage';
import InvestigationNotesPage from './pages/incidents/InvestigationNotesPage';
import IncidentStatusPage from './pages/incidents/IncidentStatusPage';
import IncidentResolutionPage from './pages/incidents/IncidentResolutionPage';
import AdminIncidentDashboard from './pages/incidents/AdminIncidentDashboard';

import AwarenessDashboard from './pages/awareness/AwarenessDashboard';
import AwarenessArticlesPage from './pages/awareness/AwarenessArticlesPage';
import AwarenessQuizPage from './pages/awareness/AwarenessQuizPage';
import AcademicIntegrityPage from './pages/awareness/AcademicIntegrityPage';
import AwarenessVideoPage from './pages/awareness/AwarenessVideoPage';
import AwarenessQuizResultsPage from './pages/awareness/AwarenessQuizResultsPage';
import AwarenessTrainingPage from './pages/awareness/AwarenessTrainingPage';
import AwarenessResourceDetailPage from './pages/awareness/AwarenessResourceDetailPage';
import AdminAwarenessPage from './pages/awareness/AdminAwarenessPage';
import AwarenessAssessmentPage from './pages/awareness/AwarenessAssessmentPage';
import AdminAssessmentManagementPage from './pages/awareness/AdminAssessmentManagementPage';

import EthicalReviewDashboard from './pages/ethical/EthicalReviewDashboard';
import AppealSubmissionPage from './pages/ethical/AppealSubmissionPage';
import CaseReviewPage from './pages/ethical/CaseReviewPage';
import EvidenceReviewPage from './pages/ethical/EvidenceReviewPage';
import EthicalDecisionPage from './pages/ethical/EthicalDecisionPage';
import AppealReviewPage from './pages/ethical/AppealReviewPage';
import AppealDecisionPage from './pages/ethical/AppealDecisionPage';
import CaseHistoryPage from './pages/ethical/CaseHistoryPage';
import AdminEthicalCommitteeDashboard from './pages/ethical/AdminEthicalCommitteeDashboard';
import CreateEthicalCasePage from './pages/ethical/CreateEthicalCasePage';

// Risk Assessment Module - All 15 Pages
import RiskDashboard from './pages/risk/RiskDashboard';
import RiskStartPage from './pages/risk/RiskStartPage';
import RiskQuestionnairePage from './pages/risk/RiskQuestionnairePage';
import RiskResultPage from './pages/risk/RiskResultPage';
import RiskHistoryPage from './pages/risk/RiskHistoryPage';
import ChatbotPage from './pages/risk/ChatbotPage';
import ChatHistoryPage from './pages/risk/ChatHistoryPage';
import ThreatAwarenessDashboard from './pages/risk/ThreatAwarenessDashboard';
import PreventionTipsPage from './pages/risk/PreventionTipsPage';
import SecurityRecommendationsPage from './pages/risk/SecurityRecommendationsPage';
import PersonalSecurityDashboard from './pages/risk/PersonalSecurityDashboard';
// Admin Risk Pages
import RiskQuestionManagement from './pages/risk/RiskQuestionManagement';
import RiskAnalyticsDashboard from './pages/risk/RiskAnalyticsDashboard';
import DepartmentRiskAnalysis from './pages/risk/DepartmentRiskAnalysis';
import ChatbotKnowledgeBase from './pages/risk/ChatbotKnowledgeBase';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" />;
};

const Layout = ({ children }) => (
  <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
    <Navbar />
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: 220,
        marginTop: 72,
        padding: '1.75rem',
        minHeight: 'calc(100vh - 72px)',
      }}>
        {children}
      </main>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="dark"
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />

          <Route path="/dashboard" element={<PrivateRoute><Layout><UserDashboard /></Layout></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>} />

          {/* Incidents */}
          <Route path="/incidents/report" element={<PrivateRoute><Layout><IncidentReportPage /></Layout></PrivateRoute>} />
          <Route path="/incidents/academic" element={<PrivateRoute><Layout><AcademicViolationPage /></Layout></PrivateRoute>} />
          <Route path="/incidents" element={<PrivateRoute><Layout><IncidentListPage /></Layout></PrivateRoute>} />
          <Route path="/incidents/:id" element={<PrivateRoute><Layout><IncidentDetailPage /></Layout></PrivateRoute>} />
          <Route path="/incidents/history" element={<PrivateRoute><Layout><IncidentHistoryPage /></Layout></PrivateRoute>} />
          <Route path="/incidents/:id/evidence" element={<PrivateRoute><Layout><EvidenceUploadPage /></Layout></PrivateRoute>} />
          <Route path="/incidents/:id/notes" element={<PrivateRoute><Layout><InvestigationNotesPage /></Layout></PrivateRoute>} />
          <Route path="/incidents/:id/status" element={<AdminRoute><Layout><IncidentStatusPage /></Layout></AdminRoute>} />
          <Route path="/incidents/:id/resolve" element={<AdminRoute><Layout><IncidentResolutionPage /></Layout></AdminRoute>} />
          <Route path="/admin/incidents" element={<AdminRoute><Layout><AdminIncidentDashboard /></Layout></AdminRoute>} />

          {/* Awareness */}
          <Route path="/awareness" element={<PrivateRoute><Layout><AwarenessDashboard /></Layout></PrivateRoute>} />
          <Route path="/awareness/articles" element={<PrivateRoute><Layout><AwarenessArticlesPage /></Layout></PrivateRoute>} />
          <Route path="/awareness/articles/:id" element={<PrivateRoute><Layout><AwarenessResourceDetailPage /></Layout></PrivateRoute>} />
          <Route path="/awareness/quiz" element={<PrivateRoute><Layout><AwarenessQuizPage /></Layout></PrivateRoute>} />
          <Route path="/awareness/quiz/results" element={<PrivateRoute><Layout><AwarenessQuizResultsPage /></Layout></PrivateRoute>} />
          <Route path="/awareness/videos" element={<PrivateRoute><Layout><AwarenessVideoPage /></Layout></PrivateRoute>} />
          <Route path="/awareness/integrity" element={<PrivateRoute><Layout><AcademicIntegrityPage /></Layout></PrivateRoute>} />
          <Route path="/awareness/training" element={<PrivateRoute><Layout><AwarenessTrainingPage /></Layout></PrivateRoute>} />
          <Route path="/awareness/admin" element={<AdminRoute><Layout><AdminAwarenessPage /></Layout></AdminRoute>} />
          <Route path="/awareness/assessment" element={<PrivateRoute><Layout><AwarenessAssessmentPage /></Layout></PrivateRoute>} />
          <Route path="/awareness/admin/assessments" element={<AdminRoute><Layout><AdminAssessmentManagementPage /></Layout></AdminRoute>} />

          {/* Ethical Review and Appeals - 9 Pages */}
          <Route path="/ethical" element={<PrivateRoute><Layout><EthicalReviewDashboard /></Layout></PrivateRoute>} />
          <Route path="/ethical/create" element={<PrivateRoute><Layout><CreateEthicalCasePage /></Layout></PrivateRoute>} />
          <Route path="/ethical/case/:id" element={<PrivateRoute><Layout><CaseReviewPage /></Layout></PrivateRoute>} />
          <Route path="/ethical/evidence/:id" element={<PrivateRoute><Layout><EvidenceReviewPage /></Layout></PrivateRoute>} />
          <Route path="/ethical/decision/:id" element={<AdminRoute><Layout><EthicalDecisionPage /></Layout></AdminRoute>} />
          <Route path="/ethical/appeal" element={<PrivateRoute><Layout><AppealSubmissionPage /></Layout></PrivateRoute>} />
          <Route path="/ethical/appeal-review" element={<AdminRoute><Layout><AppealReviewPage /></Layout></AdminRoute>} />
          <Route path="/ethical/appeal-decision/:id" element={<AdminRoute><Layout><AppealDecisionPage /></Layout></AdminRoute>} />
          <Route path="/ethical/history" element={<PrivateRoute><Layout><CaseHistoryPage /></Layout></PrivateRoute>} />
          <Route path="/ethical/admin" element={<AdminRoute><Layout><AdminEthicalCommitteeDashboard /></Layout></AdminRoute>} />

          {/* ── Risk Assessment Module (15 pages) ───────────────────────── */}
          {/* User pages */}
          <Route path="/risk" element={<PrivateRoute><Layout><RiskDashboard /></Layout></PrivateRoute>} />
          <Route path="/risk/start" element={<PrivateRoute><Layout><RiskStartPage /></Layout></PrivateRoute>} />
          <Route path="/risk/questionnaire" element={<PrivateRoute><Layout><RiskQuestionnairePage /></Layout></PrivateRoute>} />
          <Route path="/risk/result" element={<PrivateRoute><Layout><RiskResultPage /></Layout></PrivateRoute>} />
          <Route path="/risk/history" element={<PrivateRoute><Layout><RiskHistoryPage /></Layout></PrivateRoute>} />
          <Route path="/risk/chatbot" element={<PrivateRoute><Layout><ChatbotPage /></Layout></PrivateRoute>} />
          <Route path="/risk/chat-history" element={<PrivateRoute><Layout><ChatHistoryPage /></Layout></PrivateRoute>} />
          <Route path="/risk/threats" element={<PrivateRoute><Layout><ThreatAwarenessDashboard /></Layout></PrivateRoute>} />
          <Route path="/risk/prevention" element={<PrivateRoute><Layout><PreventionTipsPage /></Layout></PrivateRoute>} />
          <Route path="/risk/recommendations" element={<PrivateRoute><Layout><SecurityRecommendationsPage /></Layout></PrivateRoute>} />
          <Route path="/risk/personal" element={<PrivateRoute><Layout><PersonalSecurityDashboard /></Layout></PrivateRoute>} />
          {/* Admin pages */}
          <Route path="/risk/admin/questions" element={<AdminRoute><Layout><RiskQuestionManagement /></Layout></AdminRoute>} />
          <Route path="/risk/admin/analytics" element={<AdminRoute><Layout><RiskAnalyticsDashboard /></Layout></AdminRoute>} />
          <Route path="/risk/admin/departments" element={<AdminRoute><Layout><DepartmentRiskAnalysis /></Layout></AdminRoute>} />
          <Route path="/risk/admin/knowledge" element={<AdminRoute><Layout><ChatbotKnowledgeBase /></Layout></AdminRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Layout><UserManagementPage /></Layout></AdminRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
