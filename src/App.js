import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConceptsPage from './pages/ConceptsPage'; // Import ConceptsPage  <-- IMPORT HERE
import './App.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/concepts" element={<ConceptsPage />} /> {/* Route for ConceptsPage  <-- ADD ROUTE */}
        {/* You'll add more routes here later */}
      </Routes>
    </div>
  );
}

export default App;