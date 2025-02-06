import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';
import styles from './ProfilePage.module.css';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';

function CollapsibleSection({ title, children, isOpen, toggleOpen }) {
  return (
    <div className={styles.collapsibleSection}>
      <div className={styles.sectionHeader} onClick={toggleOpen}>
        <h2>{title}</h2>
        <span className={styles.toggleIcon}>{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && <div className={styles.sectionContent}>{children}</div>}
    </div>
  );
}

function ProfilePage() {
  const { user, getApiKey, logout } = useContext(AuthContext);
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const [likedWebsites, setLikedWebsites] = useState([]);
  const [sharedWebsites, setSharedWebsites] = useState([]);
  const [createdWebsites, setCreatedWebsites] = useState([]); // New state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const [sectionsState, setSectionsState] = useState({
    created: true,
    liked: false,
    shared: false
  });

  useEffect(() => {
    async function fetchWebsites() {
      try {
        const apiKey = getApiKey();
        // Fetch Liked Websites
        const likedResponse = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/liked-websites`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        setLikedWebsites(likedResponse.data);
        // Fetch Shared Websites
        const sharedResponse = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/shared-websites`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        setSharedWebsites(sharedResponse.data);
        // New: Fetch Created Websites
        const createdResponse = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/created-websites`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        setCreatedWebsites(createdResponse.data);
      } catch (err) {
        console.error('Error fetching profile websites:', err);
      }
    }
    if (user) {
      fetchWebsites();
    }
  }, [user, getApiKey]);

  // New: Update the body style based on dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.body.style.backgroundColor = "#333"; // Dark background
      document.body.style.color = "#FFF";            // Light text
    } else {
      document.body.style.backgroundColor = "#FFF";  // Light background
      document.body.style.color = "#000";            // Dark text
    }
  }, [isDarkMode]);

  const handleLogoutConfirm = () => {
    // Remove only the authentication token, for example 'apiKey'
    localStorage.removeItem('apiKey');
    // If you store user info in localStorage, remove that too, e.g.:
    localStorage.removeItem('user');
    if (logout) logout();
    navigate('/');
  };

  const toggleSection = (section) => {
    setSectionsState(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={styles.profilePage}>
      {/* User Profile Header */}
      <header className={styles.profileHeader}>
        <div className={styles.headerContent}>
          <div className={styles.userAvatar}>
            {user.username ? user.username[0].toUpperCase() : 'U'}
          </div>
          <h1 className={styles.userName}>Welcome, {user.username}!</h1>
          <p className={styles.userEmail}>{user.email}</p>
        </div>
        <div className={styles.headerControls}>
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
          <button 
            className={styles.logoutButton}
            onClick={() => setShowLogoutModal(true)}
          >
            Log Out
          </button>
        </div>
      </header>

      <div className={styles.profileContent}>
        {/* Collapsible Created Websites Section */}
        <CollapsibleSection 
          title={`Created Websites (${createdWebsites.length})`}
          isOpen={sectionsState.created}
          toggleOpen={() => toggleSection('created')}
        >
          <div className={styles.websitesGrid}>
            {createdWebsites.map(website => (
              <WebsiteCard key={website.website_id} website={website} />
            ))}
          </div>
        </CollapsibleSection>

        {/* Collapsible Liked Websites Section */}
        <CollapsibleSection 
          title={`Liked Websites (${likedWebsites.length})`}
          isOpen={sectionsState.liked}
          toggleOpen={() => toggleSection('liked')}
        >
          <div className={styles.websitesGrid}>
            {likedWebsites.map(website => (
              <WebsiteCard key={website.website_id} website={website} />
            ))}
          </div>
        </CollapsibleSection>

        {/* Collapsible Shared Websites Section */}
        <CollapsibleSection 
          title={`Shared Websites (${sharedWebsites.length})`}
          isOpen={sectionsState.shared}
          toggleOpen={() => toggleSection('shared')}
        >
          <div className={styles.websitesGrid}>
            {sharedWebsites.map(website => (
              <WebsiteCard key={website.website_id} website={website} />
            ))}
          </div>
        </CollapsibleSection>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Confirm Logout</h2>
            <p>Are you sure you want to log out?</p>
            <div className={styles.modalActions}>
              <button onClick={handleLogoutConfirm} className={styles.logoutConfirm}>
                Log Out
              </button>
              <button onClick={() => setShowLogoutModal(false)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;