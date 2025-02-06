import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import { Link } from 'react-router-dom';
import styles from './CommunitiesPage.module.css';
import { ThemeContext } from '../context/ThemeContext';

function CommunitiesPage() {
  const { user, getApiKey } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  useEffect(() => {
    async function fetchCommunities() {
      if (!user) { 
        console.error("User is not available in CommunitiesPage useEffect");
        return;
      }
      try {
        setLoading(true);
        const apiKey = getApiKey();
        const response = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/communities`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        setCommunities(response.data);
      } catch (err) {
        console.error('Error fetching communities:', err.response || err);
        setError('Failed to load communities. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
  }, [user, getApiKey]);

  const openLeaveModal = (community) => {
    setSelectedCommunity(community);
    setShowLeaveModal(true);
  };

  const handleLeaveCommunity = async () => {
    if (!selectedCommunity || !user) return;
    try {
      const apiKey = getApiKey();
      await axios.post(
        `${API_BASE_URL}/communities/${selectedCommunity.website_id}/leave`,
        { user_id: user.user_id },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      setCommunities(communities.filter(c => c.website_id !== selectedCommunity.website_id));
      setShowLeaveModal(false);
    } catch (err) {
      console.error('Error leaving community:', err);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading communities...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={`${styles.communitiesPage} ${isDarkMode ? 'darkMode' : ''}`}>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Your Learning Communities</h1>
        <p className={styles.heroSubtitle}>Connect, collaborate, and learn together with fellow students</p>
      </section>

      <section className={styles.communitiesSection}>
        {communities.length > 0 ? (
          <div className={styles.communitiesGrid}>
            {communities.map(community => (
              <div key={community.website_id} className={styles.communityCard}>
                <div className={styles.communityHeader}>
                  <h3 className={styles.communityName}>
                    {community.concept_name || `Community ${community.website_id}`}
                  </h3>
                  <span className={styles.creatorName}>
                    Created by {community.username || 'Anonymous'}
                  </span>
                </div>
                <div className={styles.communityStats}>
                  <span className={styles.memberCount}>
                    {community.member_count || 0} members
                  </span>
                </div>
                <Link 
                  to={`/communities/${community.website_id}`}
                  className={styles.joinButton}
                >
                  Enter Community
                </Link>
                <button
                  onClick={() => { 
                    console.log("Opening leave modal for", community);
                    openLeaveModal(community);
                  }}
                  className={styles.leaveButton}
                >
                  Leave Community
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyCommunities}>
            <h3>No Communities Yet</h3>
            <p>Join communities to connect with other learners or create your own!</p>
            <Link to="/explore" className={styles.exploreButton}>
              Explore Communities
            </Link>
          </div>
        )}
      </section>

      {showLeaveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>
              Are you sure you want to leave the community "{selectedCommunity?.concept_name || selectedCommunity?.community_name || selectedCommunity?.website_id}"?
            </p>
            <button onClick={handleLeaveCommunity}>Leave Community</button>
            <button onClick={() => setShowLeaveModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunitiesPage;
