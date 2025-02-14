import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './WebsiteCard.module.css';
import API_BASE_URL from '../../config';
import { AuthContext } from '../../context/AuthContext';

function WebsiteCard({ website }) {
  const [likeCount, setLikeCount] = useState(website.likeCount);
  const [shareCount, setShareCount] = useState(website.shareCount);
  const [isLiked, setIsLiked] = useState(website.isLiked || false);
  const { getApiKey, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [communityJoined, setCommunityJoined] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy & Share');

  console.log('WebsiteCard component rendered with website:', website);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    async function checkCommunityMembership() {
      if (user) {
        try {
          const apiKey = getApiKey();
          const response = await axios.get(`${API_BASE_URL}/users/${user.user_id}/communities`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          const joined = response.data.some(community => community.website_id === website.website_id);
          setCommunityJoined(joined);
        } catch (err) {
          console.error("Error checking community membership:", err);
        }
      }
    }
    checkCommunityMembership();
  }, [user, website.website_id, getApiKey]);

  const handleLikeToggle = async () => {
    const apiKey = getApiKey();
    if (!isLiked) {
      const prevCount = likeCount;
      setLikeCount(likeCount + 1);
      setIsLiked(true);
      try {
        await axios.post(
          `${API_BASE_URL}/websites/${website.website_id}/like`,
          { user_id: user.user_id },
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
      } catch (err) {
        console.error('Error liking website:', err);
        setLikeCount(prevCount);
        setIsLiked(false);
      }
    } else {
      const prevCount = likeCount;
      setLikeCount(likeCount - 1);
      setIsLiked(false);
      try {
        await axios.delete(
          `${API_BASE_URL}/websites/${website.website_id}/like`,
          { data: { user_id: user.user_id }, headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
      } catch (err) {
        console.error('Error unliking website:', err);
        setLikeCount(prevCount);
        setIsLiked(true);
      }
    }
  };

  const shareUrl = window.location.origin + `/website/${website.website_id}/fullscreen`;

  const handleShare = () => {
    setShareModalVisible(true);
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyStatus('Copied!');
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/websites/${website.website_id}/share`,
        { user_id: user.user_id },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      if (response.data.message.indexOf("updated") !== -1) {
        setShareCount(shareCount + 1);
      }
      // Reset button text and close modal after delay
      setTimeout(() => {
        setCopyStatus('Copy & Share');
        setShareModalVisible(false);
      }, 1500);
    } catch (err) {
      console.error('Error updating share count or copying URL:', err);
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus('Copy & Share'), 1500);
    }
  };

  const joinCommunityConfirmed = async () => {
    try {
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/communities/${website.website_id}/join`,
        { user_id: user.user_id },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      setCommunityJoined(true);
      setShowJoinModal(false);
      const communityId = website.community_id || website.website_id;
      navigate(`/communities/${communityId}`);
    } catch (err) {
      console.error('Error joining community:', err);
      setShowJoinModal(false);
    }
  };

  const joinCommunity = () => {
    if (!communityJoined) {
      setShowJoinModal(true);
    } else {
      const communityId = website.community_id || website.website_id;
      navigate(`/communities/${communityId}`);
    }
  };

  // UPDATED: Compute memberCount using the same logic as CommunitiesPage.js
  const memberCount = website.member_count || 0;

  return (
    <div className={styles.websiteCard}>
      <div className={styles.cardMain}>
        {/* Title and Creator */}
        <h2 className={styles.websiteTitle}>{website.concept_name}</h2>
        <p className={styles.creatorInfo}>Created by {website.username || 'Anonymous'}</p>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <Link 
            to={`/website/${website.website_id}/fullscreen`}
            className={styles.actionButton}
            title="View Full Screen"
          >
            <span className={styles.icon}>🖥️</span>
            <span className={styles.buttonLabel}>View</span>
          </Link>
          <button 
            onClick={handleLikeToggle}
            className={`${styles.actionButton} ${isLiked ? styles.active : ''}`}
            title={isLiked ? "Unlike" : "Like"}
          >
            <span className={styles.icon}>❤️</span>
            <span className={styles.buttonLabel}>{likeCount}</span>
          </button>
          <button 
            onClick={handleShare}
            className={`${styles.actionButton} ${website.isShared ? styles.active : ''}`}
            title="Share"
          >
            <span className={styles.icon}>🔗</span>
            <span className={styles.buttonLabel}>{shareCount}</span>
          </button>
          <button 
            onClick={joinCommunity}
            className={`${styles.actionButton} ${communityJoined ? styles.active : ''}`}
            title={communityJoined ? "Go to Community" : "Join Community"}
          >
            <span className={styles.icon}>👥</span>
            <span className={styles.buttonLabel}>
              <div className={styles.members}>
                {memberCount > 0 
                  ? Array.from({ length: Math.min(3, memberCount) }).map((_, idx) => (
                      <div key={idx} className={styles.memberAvatar}>
                        {idx === 2 && memberCount > 3 ? `+${memberCount - 2}` : '👤'}
                      </div>
                    ))
                  : '0'
                }
              </div>
            </span>
          </button>
        </div>

        <div className={styles.metadata}>
          <span className={styles.date}>
            Created: {formatDate(website.created_at)}
          </span>
        </div>
      </div>

      {/* Share Modal */}
      {shareModalVisible && (
        <div className={styles.modalOverlay} onClick={() => setShareModalVisible(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Share Website</h3>
              <button 
                onClick={() => setShareModalVisible(false)}
                className={styles.closeModalButton}
              >×</button>
            </div>
            <div className={styles.urlBox}>{shareUrl}</div>
            <div className={styles.modalActions}>
              <button 
                onClick={handleCopyShareUrl} 
                className={`${styles.primaryButton} ${copyStatus === 'Copied!' ? styles.success : ''}`}
                disabled={copyStatus === 'Copied!'}
              >
                {copyStatus}
              </button>
              <button onClick={() => setShareModalVisible(false)} className={styles.secondaryButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Join Community</h3>
            <p>Do you want to join this community?</p>
            <div className={styles.modalActions}>
              <button onClick={joinCommunityConfirmed} className={styles.primaryButton}>Join</button>
              <button onClick={() => setShowJoinModal(false)} className={styles.secondaryButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteCard;
