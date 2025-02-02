import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';

function CommunityChatPage() {
  const { community_id } = useParams();
  const { user, getApiKey } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  useEffect(() => {
    async function fetchMessages() {
      try {
        const apiKey = getApiKey();
        const response = await axios.get(
          `${API_BASE_URL}/communities/${community_id}/messages`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    }
    fetchMessages();
    // Optionally add polling or web socket updates here for multi-user realtime chat.
  }, [community_id, getApiKey]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/communities/${community_id}/messages`,
        { user_id: user.user_id, content: newMsg },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      setMessages(prev => [...prev, response.data.data]);
      setNewMsg('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div>
      <h2>Community Chat</h2>
      <div>
        {messages.map(msg => (
          <div key={msg.message_id}>
            <strong>{msg.username}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <textarea
        value={newMsg}
        onChange={(e) => setNewMsg(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default CommunityChatPage;
