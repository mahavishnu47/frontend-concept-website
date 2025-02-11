// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

// Helper function to get the stored token if it hasn't expired
const getStoredToken = () => {
  const tokenData = localStorage.getItem('authToken');
  if (tokenData) {
    try {
      const { token, expiry } = JSON.parse(tokenData);
      if (Date.now() < expiry) {
        return token;
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (err) {
      console.error('Error parsing authToken from storage', err);
      localStorage.removeItem('authToken');
    }
  }
  return null;
};

// Create the AuthContext
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [apiKey, setApiKey] = useState(getStoredToken()); // Initialize from localStorage with expiry check
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null); // Initialize from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(!!getStoredToken()); // Determine auth state based on apiKey presence
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // On initial load, set loading to false after checking localStorage
    setLoading(false);
  }, []); // Run only once on component mount

  // Store token with 2-day expiry in localStorage
  const storeToken = (token) => {
    const expiry = Date.now() + 172800000; // 2 days in ms
    localStorage.setItem('authToken', JSON.stringify({ token, expiry }));
  };

  const register = async (registrationData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, registrationData);
      const { api_key, user: newUser } = response.data;

      storeToken(api_key);
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
        storeToken(api_key); // Store the API key with expiry for later use
        localStorage.setItem('user', JSON.stringify(loggedInUser)); // Optionally update user state
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

  // Updated helper to get API key from stored token
  const getApiKey = () => {
    return getStoredToken();
  };

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