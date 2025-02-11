import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CommunityCard.module.css';
import { AuthContext } from '../../context/AuthContext';
import API_BASE_URL from '../../config';
import axios from 'axios';

const CommunityCard = ({ community }) => {
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const { getApiKey, user } = useContext(AuthContext);
    const [memberCount, setMemberCount] = useState(community?.members?.length || 0);
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const handleLeaveCommunity = async () => {
        try {
            const apiKey = getApiKey();
            await axios.post(
                `${API_BASE_URL}/communities/${community.website_id}/leave`,
                { user_id: user.user_id },
                { headers: { Authorization: `Bearer ${apiKey}` } }
            );
            setMemberCount(prev => prev - 1);
            setShowLeaveModal(false);
            navigate('/communities');
        } catch (error) {
            console.error('Error leaving community:', error);
        }
    };

    if (!community) {
        return <div className={styles.communityCard}>Community data not available.</div>;
    }

    return (
        <div className={styles.communityCard}>
            <div className={styles.cardMain}>
                <h2 className={styles.cardTitle}>{community.concept_name}</h2>
                <p className={styles.creatorInfo}>Created by {community.username || 'Anonymous'}</p>

                <div className={styles.statsContainer}>
                    <div className={styles.members}>
                        {Array.from({ length: Math.min(3, memberCount) }).map((_, idx) => (
                            <div key={idx} className={styles.memberAvatar}>
                                {idx === 2 && memberCount > 3 ? `+${memberCount - 2}` : '👤'}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <Link 
                        to={`/communities/${community.website_id}`}
                        className={styles.actionButton}
                        title="Enter Chat"
                    >
                        <span className={styles.buttonIcon}>💬</span>
                        <span className={styles.buttonLabel}>Enter Chat</span>
                    </Link>
                    <button 
                        onClick={() => setShowLeaveModal(true)}
                        className={`${styles.actionButton} ${styles.leaveButton}`}
                        title="Leave Community"
                    >
                        <span className={styles.buttonIcon}>🚪</span>
                        <span className={styles.buttonLabel}>Leave</span>
                    </button>
                </div>

                <div className={styles.metadata}>
                    <span className={styles.date}>
                        Created: {formatDate(community.created_at)}
                    </span>
                </div>
            </div>

            {/* Leave Modal */}
            {showLeaveModal && (
                <div className={styles.modalOverlay} onClick={() => setShowLeaveModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Leave Community</h3>
                            <button 
                                onClick={() => setShowLeaveModal(false)}
                                className={styles.closeModalButton}
                            >×</button>
                        </div>
                        <p className={styles.modalText}>
                            Are you sure you want to leave the "{community.concept_name}" community? 
                            You will no longer have access to community discussions.
                        </p>
                        <div className={styles.modalActions}>
                            <button 
                                onClick={handleLeaveCommunity} 
                                className={styles.primaryButton}
                            >
                                Leave Community
                            </button>
                            <button 
                                onClick={() => setShowLeaveModal(false)} 
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
};

export default CommunityCard;
