import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage      from './pages/LandingPage';
import AuthPage         from './pages/AuthPage';
import FresherDashboard from './pages/FresherDashboard';
import StartupDashboard from './pages/StartupDashboard';
import JobList          from './pages/JobList';
import JobDetail        from './pages/JobDetail';
import MyApplications   from './pages/MyApplications';
import TrainingArena    from './pages/TrainingArena';
import PostJob          from './pages/PostJob';
import ManageJobs       from './pages/ManageJobs';
import AtsBoard         from './pages/AtsBoard';
import CompanyProfilePage from './pages/CompanyProfilePage';
import FresherProfilePage from './pages/FresherProfilePage';
import FresherResumePage  from './pages/FresherResumePage';
import StartupFollowers   from './pages/StartupFollowers';
import ChatPage         from './pages/ChatPage';
import NotFoundPage     from './pages/NotFoundPage';
import ExploreCompanies from './pages/ExploreCompanies';

// Components
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuth, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuth)  return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"     element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Fresher */}
        <Route path="/fresher/dashboard"    element={<ProtectedRoute roles={['fresher']}><FresherDashboard /></ProtectedRoute>} />
        <Route path="/fresher/jobs"         element={<ProtectedRoute roles={['fresher']}><JobList /></ProtectedRoute>} />
        <Route path="/fresher/jobs/:id"     element={<ProtectedRoute roles={['fresher']}><JobDetail /></ProtectedRoute>} />
        <Route path="/fresher/applications" element={<ProtectedRoute roles={['fresher']}><MyApplications /></ProtectedRoute>} />
        <Route path="/fresher/arena"        element={<ProtectedRoute roles={['fresher']}><TrainingArena /></ProtectedRoute>} />
        <Route path="/fresher/profile"      element={<ProtectedRoute roles={['fresher']}><FresherProfilePage /></ProtectedRoute>} />
        <Route path="/fresher/resume"       element={<ProtectedRoute roles={['fresher']}><FresherResumePage /></ProtectedRoute>} />

        {/* Startup */}
        <Route path="/startup/dashboard" element={<ProtectedRoute roles={['startup']}><StartupDashboard /></ProtectedRoute>} />
        <Route path="/startup/post-job"  element={<ProtectedRoute roles={['startup']}><PostJob /></ProtectedRoute>} />
        <Route path="/startup/jobs"      element={<ProtectedRoute roles={['startup']}><ManageJobs /></ProtectedRoute>} />
        <Route path="/startup/ats/:jobId" element={<ProtectedRoute roles={['startup']}><AtsBoard /></ProtectedRoute>} />
        <Route path="/startup/profile"   element={<ProtectedRoute roles={['startup']}><CompanyProfilePage /></ProtectedRoute>} />
        <Route path="/startup/followers" element={<ProtectedRoute roles={['startup']}><StartupFollowers /></ProtectedRoute>} />

        {/* Shared (both roles) */}
        <Route path="/companies" element={<ProtectedRoute><ExploreCompanies /></ProtectedRoute>} />
        <Route path="/company/:companyId" element={<ProtectedRoute><CompanyProfilePage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
