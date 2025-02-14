import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Removed BrowserRouter import
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConceptsPage from './pages/ConceptsPage';
import ProfilePage from './pages/ProfilePage';
import WebsitesPage from './pages/WebsitesPage';
import FullScreenWebsite from './pages/FullScreenWebsite';
import CommunityPage from './pages/CommunityPage';
import ExplanationCreatePage from './pages/ExplanationCreatePage';
import Navbar from '../src/components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityChatPage from './pages/CommunityChatPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminConceptUploadPage from './pages/AdminConceptUploadPage';
import { ThemeProvider } from './context/ThemeContext';
import './styles/theme.css';
import ThemeWrapper from './components/ThemeWrapper';
import { AuthProvider } from './context/AuthContext';
import ChatPage from './pages/ChatPage';
import BooksChatPage from './pages/BooksChatPage';

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
            <Route path="/chat" element={<BooksChatPage />} />
          </Routes>
        </ThemeWrapper>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;