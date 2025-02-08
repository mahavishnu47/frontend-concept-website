import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import styles from './CommunityCard.module.css';
import { AuthContext } from '../../context/AuthContext';
import API_BASE_URL from '../../config';
import axios from 'axios';

const CommunityCard = ({ community }) => {
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const { getApiKey, user } = useContext(AuthContext);
    const [memberCount, setMemberCount] = useState(community?.members?.length || 0);

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
        } catch (error) {
            console.error('Error leaving community:', error);
        }
    };

    if (!community) {
        return <div className={styles.card}>Community data not available.</div>;
    }

    return (
        <div className={styles.communityCard}>
            <div className={styles.header}>
                <h3 className={styles.title}>{community.concept_name}</h3>
                <div className={styles.stats}>
                    <span>👥 Members: {memberCount}</span>
                    <span>📅 {formatDate(community.created_at)}</span>
                </div>
            </div>

            <div className={styles.content}>
                {community.description && (
                    <p className={styles.description}>{community.description}</p>
                )}
                
                <div className={styles.membersList}>
                    {community.members && community.members.length > 0 ? (
                        <div className={styles.membersGrid}>
                            {community.members.slice(0, 5).map((member, index) => (
                                <div key={index} className={styles.memberAvatar}>
                                    {member.email?.[0].toUpperCase()}
                                </div>
                            ))}
                            {community.members.length > 5 && (
                                <div className={styles.memberAvatar}>
                                    +{community.members.length - 5}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>No members yet</p>
                    )}
                </div>
            </div>

            <div className={styles.actions}>
                <Link 
                    to={`/communities/${community.website_id}`} 
                    className={`${styles.actionButton} ${styles.joinButton}`}
                >
                    Visit Community
                </Link>
                {community.members?.includes(user?.user_id) && (
                    <button 
                        onClick={() => setShowLeaveModal(true)}
                        className={`${styles.actionButton} ${styles.leaveButton}`}
                    >
                        Leave Community
                    </button>
                )}
            </div>

            {/* Non-cancelable Leave Community Modal */}
            {showLeaveModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h4>Leave Community</h4>
                        <p>Are you sure you want to leave this community? This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button 
                                onClick={handleLeaveCommunity}
                                className={`${styles.actionButton} ${styles.confirmButton}`}
                            >
                                Yes, Leave Community
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityCard;
