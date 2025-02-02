import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CommunityCard.module.css';

const CommunityCard = ({ community }) => {
    // Show a placeholder if community data is not provided
    if (!community) {
        return <div className={styles.card}>Community data not available.</div>;
    }

    return (
        <div className={styles.card}>
            {/* Display the community image if it exists */}
            {community.image && (
                <img
                    src={community.image}
                    alt={community.name}
                    className={styles.image}
                />
            )}

            {/* Community name */}
            <h3>{community.name}</h3>

            {/* Display the community description if provided */}
            {community.description && <p>{community.description}</p>}

            {/* Display a list of members, or a message if no members exist */}
            <p>
                {community.members && community.members.length > 0
                    ? `Members: ${community.members.join(', ')}`
                    : 'No members yet'}
            </p>

            {/* Button to go to community details */}
            <Link to={`/communities/${community.website_id}`}>
                <button className={styles.communityButton}>Join Community</button>
            </Link>
        </div>
    );
};

export default CommunityCard;
