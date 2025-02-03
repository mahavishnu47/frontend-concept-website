import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';
import styles from './ProfilePage.module.css';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

function CollapsibleItem({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.collapsibleItem}>
      <div className={styles.collapsibleHeader} onClick={() => setIsOpen(!isOpen)}>
        {title} {isOpen ? '-' : '+'}
      </div>
      {isOpen && <div className={styles.collapsibleContent}>{children}</div>}
    </div>
  );
}

function ProfilePage() {
  const { user, getApiKey, logout } = useContext(AuthContext);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const [likedWebsites, setLikedWebsites] = useState([]);
  const [sharedWebsites, setSharedWebsites] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWebsites() {
      try {
        const apiKey = getApiKey();
        // Adjust these endpoints as per your #file:routes.py definitions
        const likedResponse = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/liked-websites`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        const sharedResponse = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/shared-websites`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        setLikedWebsites(likedResponse.data);
        setSharedWebsites(sharedResponse.data);
      } catch (err) {
        console.error('Error fetching profile websites:', err);
      }
    }
    if (user) {
      fetchWebsites();
    }
  }, [user, getApiKey]);

  const handleLogoutConfirm = () => {
    // Remove only the authentication token, for example 'apiKey'
    localStorage.removeItem('apiKey');
    // If you store user info in localStorage, remove that too, e.g.:
    localStorage.removeItem('user');
    if (logout) logout();
    navigate('/');
  };

  return (
    <div className={styles.profileContainer}>
      {/* Add this near the top of your profile content */}
      <div className={styles.themeToggle}>
        <label className={styles.switch}>
          <input 
            type="checkbox"
            checked={isDarkMode}
            onChange={() => setIsDarkMode(!isDarkMode)}
          />
          <span className={styles.slider}></span>
        </label>
        <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
      </div>
      
      <h2>Profile</h2>
      <div>
        <strong>Username:</strong> {user.username} <br />
        <strong>Email:</strong> {user.email}
      </div>

      <h1>Welcome, {user ? user.name : 'User'}</h1>
      <button 
        className={styles.ctaButton} 
        onClick={() => setShowLogoutModal(true)}
      >
        Log Out
      </button>
      
      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>Are you sure you want to log out?</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.ctaButton} 
                onClick={handleLogoutConfirm}
              >
                Log Out
              </button>
              <button 
                className={styles.cancelButton} 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Liked Websites</h3>
        {likedWebsites.length > 0 ? (
          likedWebsites.map(website => (
            <CollapsibleItem key={website.website_id} title={`Website ID ${website.website_id}`}>
              <WebsiteCard website={website} />
            </CollapsibleItem>
          ))
        ) : (
          <p>No liked websites.</p>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Shared Websites</h3>
        {sharedWebsites.length > 0 ? (
          sharedWebsites.map(website => (
            <CollapsibleItem key={website.website_id} title={`Website ID ${website.website_id}`}>
              <WebsiteCard website={website} />
            </CollapsibleItem>
          ))
        ) : (
          <p>No shared websites.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;