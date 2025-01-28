import React, { useState, useEffect, useContext } from 'react';
import styles from './ProfilePage.module.css';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getApiKey, isAuthenticated, logout } = useContext(AuthContext); // Get logout from context
  const navigate = useNavigate(); // Hook for redirection

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = getApiKey();
        if (!isAuthenticated || !apiKey) {
          setError("Not authenticated or API key missing.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/auth/me`, { // Fetch profile data from /api/auth/me
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        setUserProfile(response.data.user); // Set user profile data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile information.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [getApiKey, isAuthenticated]);

  const handleLogout = () => {
    logout(); // Call logout function from AuthContext
    navigate('/'); // Optionally redirect to landing page after logout (already done in logout function, but can add here for extra measure)
  };


  if (loading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!userProfile) {
    return <div>Could not load user profile.</div>; // Fallback if userProfile is still null after loading
  }


  return (
    <div className={styles.profilePage}>
      <section className={styles.profileSection}>
        <h2 className={styles.profileTitle}>Your Profile</h2>
        <div className={styles.profileDetails}>
          <p><strong>Username:</strong> {userProfile.username}</p>
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>User ID:</strong> {userProfile.user_id}</p>
          <p><strong>Created At:</strong> {new Date(userProfile.created_at).toLocaleDateString()}</p>
          {/* Add more profile information as needed */}
        </div>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button> {/* Logout button in Profile Page */}
      </section>
    </div>
  );
}

export default ProfilePage;