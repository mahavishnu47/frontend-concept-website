import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConceptsPage from './pages/ConceptsPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from '../src/components/NavBar';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute <---- IMPORT HERE
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes - only accessible when authenticated */}
        <Route path="/concepts" element={
          <ProtectedRoute> {/* Wrap ConceptsPage with ProtectedRoute */}
            <ConceptsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute> {/* Wrap ProfilePage with ProtectedRoute */}
            <ProfilePage />
          </ProtectedRoute>
        } />

      </Routes>
    </div>
  );
}

export default App;