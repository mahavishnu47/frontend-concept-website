import React, { useState, useContext } from 'react';
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

  console.log('WebsiteCard component rendered with website:', website);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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

  const handleShare = async () => {
    try {
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/websites/${website.website_id}/share`,
        { user_id: user.user_id },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      // Only update shareCount if share is newly added.
      if (response.data.message.indexOf('updated') !== -1) {
        setShareCount(shareCount + 1);
      }
      // Optionally add feedback for already shared.
    } catch (err) {
      console.error('Error sharing website:', err);
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
      navigate('/communities'); // already joined: redirect to communities
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
        <span>Website ID: {website.website_id}</span>
        <span>Created: {formatDate(website.created_at)}</span>
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
      </div>
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
          {communityJoined ? 'Enter Community' : 'Join Community'}
        </button>
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

      {showJoinModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>Do you want to join this community?</p>
            <button onClick={joinCommunityConfirmed}>Join</button>
            <button onClick={() => setShowJoinModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebsiteCard;
