import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';
import styles from './ProfilePage.module.css';
import { useNavigate } from 'react-router-dom';

function CollapsibleSection({ title, children, isOpen, toggleOpen, count = 0 }) {
  return (
    <div className={styles.collapsibleSection}>
      <div 
        className={`${styles.sectionHeader} ${isOpen ? styles.active : ''}`}
        onClick={toggleOpen}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && toggleOpen()}
      >
        <div className={styles.sectionTitle}>
          <h2>{title}</h2>
          <span className={styles.countBadge}>{count}</span>
        </div>
        <span className={styles.toggleIcon}>
          {isOpen ? '−' : '+'}
        </span>
      </div>
      {isOpen && (
        <div className={styles.sectionContent}>
          {children}
        </div>
      )}
    </div>
  );
}

function ProfileHeader({ user, onLogout }) {
  return (
    <header className={styles.profileHeader}>
      <div className={styles.userInfo}>
        <div className={styles.userAvatar}>
          {user.username ? user.username[0].toUpperCase() : 'U'}
        </div>
        <div className={styles.userDetails}>
          <h1 className={styles.userName}>Welcome, {user.username}!</h1>
          <p className={styles.userEmail}>{user.email}</p>
        </div>
      </div>
      <button 
        className={styles.logoutButtonTopRight}
        onClick={onLogout}
        aria-label="Log out"
      >
        Log Out
      </button>
    </header>
  );
}

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="logoutTitle">
      <div className={styles.modalContent}>
        <h2 id="logoutTitle">Confirm Logout</h2>
        <p>Are you sure you want to log out?</p>
        <div className={styles.modalActions}>
          <button 
            onClick={onConfirm} 
            className={styles.logoutConfirm}
            aria-label="Confirm logout"
          >
            Log Out
          </button>
          <button 
            onClick={onCancel} 
            className={styles.cancelButton}
            aria-label="Cancel logout"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user, getApiKey, logout } = useContext(AuthContext);
  const [likedWebsites, setLikedWebsites] = useState([]);
  const [sharedWebsites, setSharedWebsites] = useState([]);
  const [createdWebsites, setCreatedWebsites] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const [sectionsState, setSectionsState] = useState({
    created: true,
    liked: false,
    shared: false
  });

  useEffect(() => {
    document.title = `Profile - ${user?.username || 'User'}`;
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

  if (!user) {
    return (
      <div className={styles.profilePage}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <ProfileHeader 
        user={user}
        onLogout={() => setShowLogoutModal(true)}
      />

      <main className={styles.profileContent}>
        <div className={styles.sectionsGrid}>
          <CollapsibleSection 
            title="Created Websites"
            isOpen={sectionsState.created}
            toggleOpen={() => toggleSection('created')}
            count={createdWebsites.length}
          >
            <div className={styles.websitesGrid}>
              {createdWebsites.length > 0 ? (
                createdWebsites.map(website => (
                  <WebsiteCard 
                    key={website.website_id} 
                    website={website}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>You haven't created any websites yet.</p>
                </div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title="Liked Websites"
            isOpen={sectionsState.liked}
            toggleOpen={() => toggleSection('liked')}
            count={likedWebsites.length}
          >
            <div className={styles.websitesGrid}>
              {likedWebsites.map(website => (
                <WebsiteCard 
                  key={website.website_id} 
                  website={website}
                  aria-label={`Liked website: ${website.concept_name || 'Untitled'}`}
                />
              ))}
              {likedWebsites.length === 0 && (
                <p>You haven't liked any websites yet.</p>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection 
            title="Shared Websites"
            isOpen={sectionsState.shared}
            toggleOpen={() => toggleSection('shared')}
            count={sharedWebsites.length}
          >
            <div className={styles.websitesGrid}>
              {sharedWebsites.map(website => (
                <WebsiteCard 
                  key={website.website_id} 
                  website={website}
                  aria-label={`Shared website: ${website.concept_name || 'Untitled'}`}
                />
              ))}
              {sharedWebsites.length === 0 && (
                <p>You haven't shared any websites yet.</p>
              )}
            </div>
          </CollapsibleSection>
        </div>
      </main>

      {showLogoutModal && (
        <LogoutModal 
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}

export default ProfilePage;