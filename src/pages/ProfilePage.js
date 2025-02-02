import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';
import styles from './ProfilePage.module.css';

function CollapsibleItem({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={styles.collapsibleItem}>
      <div className={styles.collapsibleHeader} onClick={() => setIsOpen(!isOpen)}>
        {title} {isOpen ? '-' : '+'}
      </div>
      {isOpen && <div className={styles.collapsibleContent}>{children}</div>}
    </div>
  );
}

function ProfilePage() {
  const { user, getApiKey } = useContext(AuthContext);
  const [likedWebsites, setLikedWebsites] = useState([]);
  const [sharedWebsites, setSharedWebsites] = useState([]);

  useEffect(() => {
    async function fetchWebsites() {
      try {
        const apiKey = getApiKey();
        // Adjust these endpoints as per your #file:routes.py definitions
        const likedResponse = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/liked-websites`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        const sharedResponse = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/shared-websites`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        setLikedWebsites(likedResponse.data);
        setSharedWebsites(sharedResponse.data);
      } catch (err) {
        console.error('Error fetching profile websites:', err);
      }
    }
    if (user) {
      fetchWebsites();
    }
  }, [user, getApiKey]);

  return (
    <div className={styles.profileContainer}>
      <h2>Profile</h2>
      <div>
        <strong>Username:</strong> {user.username} <br />
        <strong>Email:</strong> {user.email}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Liked Websites</h3>
        {likedWebsites.length > 0 ? (
          likedWebsites.map(website => (
            <CollapsibleItem key={website.website_id} title={`Website ID ${website.website_id}`}>
              <WebsiteCard website={website} />
            </CollapsibleItem>
          ))
        ) : (
          <p>No liked websites.</p>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Shared Websites</h3>
        {sharedWebsites.length > 0 ? (
          sharedWebsites.map(website => (
            <CollapsibleItem key={website.website_id} title={`Website ID ${website.website_id}`}>
              <WebsiteCard website={website} />
            </CollapsibleItem>
          ))
        ) : (
          <p>No shared websites.</p>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;