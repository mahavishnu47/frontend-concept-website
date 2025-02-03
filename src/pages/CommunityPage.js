import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import './CommunityPage.css'; // Chat styling

function CommunityPage() {
  const { community_id } = useParams();
  const { getApiKey, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useRef(null); // NEW: declare socket ref

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const apiKey = getApiKey();
        if (!community_id || !apiKey) return;  // remove user check
        const response = await axios.get(
          `${API_BASE_URL}/communities/${community_id}/messages`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        // Sort messages in descending order by created_at
        const sortedMessages = response.data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setMessages(sortedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();

    socket.current = io(`${API_BASE_URL}/community`, { 
      path: '/socket.io',
      reconnection: true // NEW: enable auto-reconnection
    });
    
    // Listen for connection events
    socket.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    socket.current.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      socket.current.emit('join', community_id); // NEW: rejoin the room on reconnection
    });
    
    socket.current.emit('join', community_id);
    socket.current.on('new_message', (message) => {
      // Append only if message belongs to this community
      if (message.website_id === parseInt(community_id, 10)) {
        setMessages(prev => [message, ...prev]);
      }
    });
    return () => {
      socket.current.disconnect();
    };
  }, [community_id, getApiKey]); // Removed 'user' dependency

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add locally so UI updates right away
    setMessages(prev => [
      {
        post_id: Date.now(), // Temporary ID
        user_id: user.user_id,
        website_id: parseInt(community_id, 10),
        content: newMessage,
        created_at: new Date().toISOString()
      },
      ...prev
    ]);

    socket.current.emit('send_message', {
      community_id,
      user_id: user.user_id,
      content: newMessage
    });

    setNewMessage('');
  };

  const renderMessage = (msg) => {
    const isOwn = msg.user_id === user.user_id;
    // Display a circle with the sender’s initial for messages not sent by the current user
    const initial = (!isOwn && msg.user_email && msg.user_email[0].toUpperCase()) || (!isOwn ? '?' : '');
    return (
      <div key={msg.post_id} className={`message ${isOwn ? 'own' : 'other'}`}>
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
        {messages.map(msg => renderMessage(msg))}
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
