import React, { useState, useContext } from 'react';
import { default as ReactMarkdown } from 'react-markdown';
import styles from './ConceptCard.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config';

function ConceptCard({ concept }) {
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy Content');
  const { getApiKey, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleContent = () => {
    setIsContentVisible(!isContentVisible);
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(concept.content);
      setCopyStatus('Copied!');
      setTimeout(() => {
        setCopyStatus('Copy Content');
        setIsContentVisible(false);
      }, 1500);
    } catch (err) {
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus('Copy Content'), 1500);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const apiKey = getApiKey();
      await axios.post(
        `${API_BASE_URL}/communities/${concept.website_id}/join`,
        { user_id: user.user_id },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      navigate(`/communities/${concept.website_id}`);
    } catch (err) {
      console.error('Error joining community:', err);
    }
  };

  return (
    <div className={styles.conceptCard}>
      <div className={styles.cardMain}>
        {/* Concept Title */}
        <h2 className={styles.conceptTitle}>{concept.conceptName}</h2>
        
        {/* Subject Info Tags */}
        <div className={styles.tags}>
          <div className={styles.tag}><span className={styles.tagIcon}>📚</span>{concept.grade}</div>
          <div className={styles.tag}><span className={styles.tagIcon}>🌐</span>{concept.medium}</div>
          <div className={styles.tag}><span className={styles.tagIcon}>📖</span>{concept.subject}</div>
        </div>

        {/* Learn More Button */}
        <button 
          className={styles.learnMoreButton} 
          onClick={toggleContent}
          title={isContentVisible ? "Click to hide content" : "Click to view detailed content"}
        >
          <span className={styles.buttonText}>
            {isContentVisible ? 'Show Less' : 'Learn More'}
          </span>
          <span className={styles.buttonIcon}>
            {isContentVisible ? '−' : '+'}
          </span>
        </button>
      </div>

      {/* Collapsible Content Section */}
      {isContentVisible && (
        <div className={styles.contentSection}>
          <div className={styles.scrollableContent}>
            {concept.content ? (
              <>
                <ReactMarkdown>{concept.content}</ReactMarkdown>
                <button 
                  onClick={handleCopyContent}
                  className={`${styles.copyButton} ${copyStatus === 'Copied!' ? styles.success : ''}`}
                  disabled={copyStatus === 'Copied!'}
                >
                  {copyStatus === 'Copied!' ? '✓' : '📋'} {copyStatus}
                </button>
              </>
            ) : (
              <p className={styles.noContent}>No content available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ConceptCard;