import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConceptsPage from './pages/ConceptsPage';
import ProfilePage from './pages/ProfilePage'; // Import ProfilePage <---- IMPORT HERE
import Navbar from './components/NavBar' // Import Navbar <---- IMPORT HERE
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar /> {/* Include Navbar component at the top */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/concepts" element={<ConceptsPage />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* Route for ProfilePage <---- ADD ROUTE */}
      </Routes>
    </div>
  );
}

export default App;