import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './WebsiteCard.module.css';
import API_BASE_URL from '../../config';
import { AuthContext } from '../../context/AuthContext';

function WebsiteCard({ website }) {
  // Initialize the like state based on website data, if available.
  const [likeCount, setLikeCount] = useState(website.likeCount);
  const [shareCount, setShareCount] = useState(website.shareCount);
  const [isLiked, setIsLiked] = useState(website.isLiked || false); // Modified: based on backend flag
  const { getApiKey, user } = useContext(AuthContext);
  const navigate = useNavigate();
  // Initialize communityJoined to false instead of website.community_id
  const [communityJoined, setCommunityJoined] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  console.log('WebsiteCard component rendered with website:', website);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // NEW: Check if user has already joined this website's community on mount
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

  // NEW: Construct the share URL for fullscreen view
  const shareUrl = window.location.origin + `/website/${website.website_id}/fullscreen`;

  // Modify handleShare: show the share modal instead of immediate share update
  const handleShare = () => {
    setShareModalVisible(true);
  };

  // NEW: Function to copy the share URL and update share count
  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // After copying, update the share count via API
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/websites/${website.website_id}/share`,
        { user_id: user.user_id },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      if (response.data.message.indexOf("updated") !== -1) {
        setShareCount(shareCount + 1);
      }
      setShareModalVisible(false);
    } catch (err) {
      console.error('Error updating share count or copying URL:', err);
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
      // Update state and navigate using the available id
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
      // Navigate to the specific community page
      const communityId = website.community_id || website.website_id;
      navigate(`/communities/${communityId}`);
    }
  };

  return (
    <div className={styles.websiteCard}>
      <div className={styles.header}>
        {website.concept_name ? (
          <div className={styles.conceptName}>
            <strong>{website.concept_name}</strong>
          </div>
        ) : null}
        {/* <span>Website ID: {website.website_id}</span> */}
        
        <Link 
          to={`/website/${website.website_id}/fullscreen`}
          className={styles.fullScreenButton}
        >
          View Full Screen
        </Link>
      </div>
      <div className={styles.stats}>
        <span>👍 {likeCount}</span>
        <span>🔄 {shareCount}</span>
        <span>Members: {website.member_count || 0}</span>
      </div>
      {/* NEW: Display number of community members */}
      <div className={styles.actions}>
        <button 
          onClick={handleLikeToggle} 
          className={styles.actionButton}
        >
          {isLiked ? 'Unlike' : 'Like'}
        </button>
        <button 
          onClick={handleShare} 
          className={styles.actionButton}
        >
          Share
        </button>
        <button 
          onClick={joinCommunity} 
          className={styles.actionButton}
        >
          {communityJoined ? 'Go to Community' : 'Join Community'}
        </button>
        {/* "Learn More" button removed */}
      </div>
      <div className={styles.websiteContent}>
        <iframe
          srcDoc={website.website_code}
          title={`Website ${website.website_id}`}
          className={styles.websiteFrame}
          // Updated sandbox attribute to allow same-origin 
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
      <div>
      <span>Created: {formatDate(website.created_at)}</span>
      </div>

      {showJoinModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>Do you want to join this community?</p>
            <button onClick={joinCommunityConfirmed}>Join</button>
            <button onClick={() => setShowJoinModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {shareModalVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>Share this URL with others:</p>
            <p>{shareUrl}</p>
            <button onClick={handleCopyShareUrl}>Copy & Share</button>
            <button onClick={() => setShareModalVisible(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteCard;
