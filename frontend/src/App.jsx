import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import ResumeScreening from './pages/ResumeScreening';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateJob from './pages/CreateJob';
import JobDetails from './pages/JobDetails';
import CandidateGuidance from './pages/CandidateGuidance';
import CandidateFeedback from './pages/CandidateFeedback';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Main App Routes (Recruiter) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route 
              path="/resume-screening" 
              element={
                <ProtectedRoute>
                  <ResumeScreening />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-job" 
              element={
                <ProtectedRoute>
                  <CreateJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs/:id" 
              element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Public Candidate Routes (Standalone) */}
          <Route element={<PublicLayout />}>
            <Route path="/guidance/:id" element={<CandidateGuidance />} />
            <Route path="/feedback/:id" element={<CandidateFeedback />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
