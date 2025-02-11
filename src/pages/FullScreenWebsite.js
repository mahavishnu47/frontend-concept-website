import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './FullScreenWebsite.module.css';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';

function FullScreenWebsite() {
    const navigate = useNavigate();
    const { website_id } = useParams();
    const [websiteContent, setWebsiteContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [shareCount, setShareCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isShared, setIsShared] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const { getApiKey, user } = useContext(AuthContext);

    const fetchWebsite = async () => {
        try {
            const apiKey = getApiKey();
            // Append user_id as query parameter if available
            const url = user && user.user_id 
                ? `${API_BASE_URL}/websites/${website_id}?user_id=${user.user_id}` 
                : `${API_BASE_URL}/websites/${website_id}`;
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
            if (response.data && response.data.website_code) {
                setWebsiteContent(response.data.website_code);
                setLikeCount(response.data.likeCount || 0);
                setShareCount(response.data.shareCount || 0);
                setIsLiked(response.data.isLiked || false);
                setIsShared(response.data.isShared || false);
            } else {
                console.error('Website code not found or incomplete.');
            }
        } catch (error) {
            console.error('Error fetching website:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebsite();
    }, [website_id, getApiKey]);

    const handleLike = async () => {
        if (!user) return;
        const apiKey = getApiKey();
        if (!isLiked) {
            const prevCount = likeCount;
            setLikeCount(likeCount + 1);
            setIsLiked(true);
            try {
                await axios.post(
                    `${API_BASE_URL}/websites/${website_id}/like`,
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
                    `${API_BASE_URL}/websites/${website_id}/like`,
                    { data: { user_id: user.user_id }, headers: { 'Authorization': `Bearer ${apiKey}` } }
                );
            } catch (err) {
                console.error('Error unliking website:', err);
                setLikeCount(prevCount);
                setIsLiked(true);
            }
        }
    };

    const handleShare = () => {
        setShareModalVisible(true);
    };

    const handleCopyShareUrl = async () => {
        const shareUrl = window.location.origin + `/website/${website_id}/fullscreen`;
        try {
            await navigator.clipboard.writeText(shareUrl);
            const apiKey = getApiKey();
            // Only update share count if the website hasn't been shared yet
            if (!isShared) {
                const response = await axios.post(
                    `${API_BASE_URL}/websites/${website_id}/share`,
                    { user_id: user.user_id },
                    { headers: { 'Authorization': `Bearer ${apiKey}` } }
                );
                if (response.data.message.indexOf("updated") !== -1) {
                    setShareCount(shareCount + 1);
                    setIsShared(true); // Mark as shared
                }
            }
            setShareModalVisible(false);
        } catch (err) {
            console.error('Error updating share count or copying URL:', err);
        }
    };

    const handleClose = () => {
        navigate('/websites');
    };

    if (loading) {
        return <div className={styles.loading}>Loading website...</div>;
    }

    return (
        <div className={styles.fullscreenContainer}>
            <div className={styles.sideControls}>
                <button 
                    className={styles.closeButton}
                    onClick={handleClose}
                    aria-label="Close website"
                >
                    ×
                </button>
                <div className={styles.actionButtons}>
                    <button 
                        onClick={handleLike} 
                        className={`${styles.optionButton} ${isLiked ? styles.active : ''}`}
                        title={isLiked ? "Unlike" : "Like"}
                    >
                        <span className={styles.icon}>❤️</span>
                        <span className={styles.count}>{likeCount}</span>
                    </button>
                    <button 
                        onClick={handleShare} 
                        className={`${styles.optionButton} ${isShared ? styles.active : ''}`}
                        title="Share"
                    >
                        <span className={styles.icon}>🔗</span>
                        <span className={styles.count}>{shareCount}</span>
                    </button>
                </div>
            </div>

            <iframe
                srcDoc={websiteContent}
                className={styles.websiteFrame}
                title="Educational Website"
                frameBorder="0"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-popups"
            />

            {shareModalVisible && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Share Website</h3>
                        <p>Share this URL with others:</p>
                        <div className={styles.urlBox}>
                            {window.location.origin + `/website/${website_id}/fullscreen`}
                        </div>
                        <div className={styles.modalActions}>
                            <button 
                                onClick={handleCopyShareUrl}
                                className={styles.primaryButton}
                            >
                                Copy & Share
                            </button>
                            <button 
                                onClick={() => setShareModalVisible(false)}
                                className={styles.secondaryButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FullScreenWebsite;