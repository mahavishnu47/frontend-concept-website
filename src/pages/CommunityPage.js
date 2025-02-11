import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import './CommunityPage.css';

function CommunityPage() {
  const { community_id } = useParams();
  const { getApiKey, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const apiKey = getApiKey();
        if (!community_id || !apiKey) return;
        const response = await axios.get(
          `${API_BASE_URL}/communities/${community_id}/messages`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        const sortedMessages = response.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setMessages(sortedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [community_id, getApiKey]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const moderationRes = await fetch(`${API_BASE_URL}/communities/${community_id}/moderate-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      });
      const moderationResult = await moderationRes.json();
      if (!moderationResult.safe) {
        alert("Your message must focus on educational topics related to this community.");
        return;
      }
    } catch (error) {
      console.error("Moderation error:", error);
      alert("Message moderation failed. Please try again.");
      return;
    }

    try {
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/communities/${community_id}/messages`,
        {
          user_id: user.user_id,
          content: newMessage
        },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      setMessages(prev => [response.data.data, ...prev]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const renderMessage = (msg, idx) => {
    const isOwn = msg.user_id === user.user_id;
    const initial = (!isOwn && msg.user_email && msg.user_email[0].toUpperCase()) 
                    || (!isOwn ? '?' : '');
    return (
      <div key={msg.post_id || `${msg.user_id}-${msg.created_at}-${idx}`} className={`message ${isOwn ? 'own' : 'other'}`}>
        {!isOwn && (
          <div className="user-circle">
            {initial}
          </div>
        )}
        <div className="message-content">
          <p>{msg.content}</p>
          <small>{new Date(msg.created_at).toLocaleTimeString()}</small>
        </div>
      </div>
    );
  };

  return (
    <div className="community-chat-container">
      <h2>Community Chat: {community_id}</h2>
      <div className="messages-container">
        {messages.map((msg, index) => renderMessage(msg, index))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          placeholder="Enter your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default CommunityPage;
