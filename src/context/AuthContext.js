// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

// Create the AuthContext
const AuthContext = createContext();

function AuthProvider({ children }) {
  // Initialize from localStorage using "authToken" and "user"
  const [apiKey, setApiKey] = useState(localStorage.getItem('authToken') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // On initial load, set loading to false after checking localStorage
    setLoading(false);
  }, []); // Run only once on component mount


  const register = async (registrationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, registrationData);
      const { api_key, user: newUser } = response.data;

      localStorage.setItem('authToken', api_key); // Use consistent key "authToken"
      localStorage.setItem('user', JSON.stringify(newUser));
      setApiKey(api_key);
      setUser(newUser);
      setIsAuthenticated(true);
      setLoading(false);
      setSuccessMessage('Registration successful! You can now login.'); // You can manage success message here if needed
      navigate('/concepts'); // Redirect after registration

      return { success: true }; // Indicate success
    } catch (error) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      setIsAuthenticated(false);
      setLoading(false);
      return { success: false, error: error.response?.data?.message || 'Registration failed.' }; // Indicate failure and return error message
    }
  };


  const login = async (loginData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
      const { api_key, user: loggedInUser } = response.data;

      if (api_key) {
        localStorage.setItem('authToken', api_key); // Store token under "authToken"
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setApiKey(api_key);
        setIsAuthenticated(true);
        setLoading(false);
        navigate('/concepts'); // Redirect after login
        return { success: true }; // Indicate success
      }
      return { success: false, error: 'No API key returned' };
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Login failed. Invalid credentials.');
      setIsAuthenticated(false);
      setLoading(false);
      return { success: false, error: error.response?.data?.message || 'Login failed.' }; // Indicate failure and return error message
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setApiKey(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/'); // Redirect to landing page after logout
  };

  const getApiKey = () => localStorage.getItem('authToken'); // Helper function to get API key

  const contextValue = {
    apiKey,
    user,
    isAuthenticated,
    loading,
    error,
    successMessage,
    register,
    login,
    logout,
    getApiKey // Include getApiKey in context value
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children} {/* Render children only after initial loading is done */}
      {loading && <div>Loading App...</div>} {/* Optional loading indicator while checking auth state */}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };