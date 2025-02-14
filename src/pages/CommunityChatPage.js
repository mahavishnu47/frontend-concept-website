import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import styles from './CommunityChatPage.module.css';

function CommunityChatPage() {
  const { community_id } = useParams();
  const { user, getApiKey } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const apiKey = getApiKey();
        const response = await axios.get(
          `${API_BASE_URL}/communities/${community_id}`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        
        console.log('Community details:', response.data);
        
        if (response.data && response.data.community) {
          setCommunity({
            concept_name: response.data.community.concept_name,
            username: response.data.community.username || 'Anonymous',
            website_id: response.data.community.website_id,
            created_at: response.data.community.created_at
          });
        }
      } catch (err) {
        console.error('Error fetching community details:', err);
      }
    };

    const fetchMessages = async () => {
      try {
        const apiKey = getApiKey();
        const response = await axios.get(
          `${API_BASE_URL}/communities/${community_id}/messages`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    if (community_id) {
      fetchCommunityDetails();
      fetchMessages();
    }
  }, [community_id, getApiKey]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    try {
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/communities/${community_id}/messages`,
        { user_id: user.user_id, content: newMsg },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      setMessages(prev => [...prev, response.data]);
      setNewMsg('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className={`${styles.chatPage} ${isDarkMode ? 'darkMode' : ''}`}>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          {community ? community.concept_name : 'Loading...'}
        </h1>
        <p className={styles.heroSubtitle}>
          Created by {community ? community.username : 'Anonymous'}
        </p>
        {community && community.created_at && (
          <p className={styles.creationDate}>
            Created on {new Date(community.created_at).toLocaleDateString()}
          </p>
        )}
      </section>

      <div className={styles.mainSection}>
        <div className={styles.chatContainer}>
          {loading ? (
            <div className={styles.loading}>Loading messages...</div>
          ) : (
            <div className={styles.messagesContainer}>
              {messages.map((msg, idx) => (
                <div 
                  key={msg.post_id || idx}
                  className={`${styles.message} ${msg.user_id === user.user_id ? styles.ownMessage : ''}`}
                >
                  {msg.user_id !== user.user_id && (
                    <div className={styles.userAvatar}>
                      {msg.user_email?.[0].toUpperCase() || '?'}
                    </div>
                  )}
                  <div className={styles.messageContent}>
                    <p>{msg.content}</p>
                    <span className={styles.messageTime}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={sendMessage} className={styles.messageForm}>
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type your message..."
              className={styles.messageInput}
            />
            <button type="submit" className={styles.sendButton}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CommunityChatPage;
