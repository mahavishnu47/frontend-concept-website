import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom'; // Import Navigate for redirection
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext); // Get isAuthenticated and loading from AuthContext

  if (loading) {
    return <div>Loading... Checking Authentication</div>; // Or a more sophisticated loading indicator
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />; // Use Navigate to redirect
  }

  // User is authenticated, render the children (the protected component)
  return children;
}

export default ProtectedRoute;