import React from 'react';  // Remove useContext since we don't need it here
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConceptsPage from './pages/ConceptsPage';
import ProfilePage from './pages/ProfilePage';
import WebsitesPage from './pages/WebsitesPage';
import FullScreenWebsite from './pages/FullScreenWebsite';
import CommunityPage from './pages/CommunityPage'; // Import CommunityPage
import ExplanationCreatePage from './pages/ExplanationCreatePage';
import Navbar from '../src/components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityChatPage from './pages/CommunityChatPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminConceptUploadPage from './pages/AdminConceptUploadPage';
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme.css';  // Import global theme styles
import ThemeWrapper from './components/ThemeWrapper';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeWrapper>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes - only accessible when authenticated */}
            <Route path="/concepts" element={
              <ProtectedRoute>
                <ConceptsPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/websites" element={
              <ProtectedRoute>
                <WebsitesPage />
              </ProtectedRoute>
            } />
            <Route path="/website/:website_id/fullscreen" element={
              <ProtectedRoute>
                <FullScreenWebsite />
              </ProtectedRoute>
            } />
            <Route path="/communities/:community_id" element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } />
            {/* Optionally a list view */}
            <Route path="/communities" element={
              <ProtectedRoute>
                <CommunitiesPage />
              </ProtectedRoute>
            } />
            <Route path="/communities/:community_id" element={
              <ProtectedRoute>
                <CommunityChatPage />
              </ProtectedRoute>
            } />
            <Route path="/create-explanation" element={
              <ProtectedRoute>
                <ExplanationCreatePage />
              </ProtectedRoute>
            } />
            <Route 
              path="/admin/upload-concept" 
              element={
                <ProtectedAdminRoute>
                  <AdminConceptUploadPage />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
        </ThemeWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;