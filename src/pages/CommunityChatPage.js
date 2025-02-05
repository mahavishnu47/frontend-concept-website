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
    console.log("[DEBUG] CommunityChatPage useEffect triggered with community_id:", community_id);
    async function fetchMessages() {
      try {
        const apiKey = getApiKey();
        console.log('Fetching messages for community_id:', community_id);
        console.log('Using API key:', apiKey);
        
        const response = await axios.get(
          `${API_BASE_URL}/chat_messages?website_id=${community_id}`,
          { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        console.log('Received messages:', response.data);
        setMessages(response.data);
      } catch (err) {
        console.error('Error fetching messages:', err.response?.data || err.message);
      }
    }
    fetchMessages();
    // Optionally add polling or web socket updates here for multi-user realtime chat.
  }, [community_id, getApiKey]);

  const sendMessage = async () => {
    console.log("[DEBUG] sendMessage triggered with newMsg:", newMsg);
    if (!newMsg.trim()) return;
    try {
      const apiKey = getApiKey();
      console.log("[DEBUG] Sending message with API_BASE_URL:", API_BASE_URL);
      console.log("[DEBUG] Payload:", { website_id: community_id, user_id: user.user_id, content: newMsg });
      
      const response = await axios.post(
        `${API_BASE_URL}/chat_messages`,
        { website_id: community_id, user_id: user.user_id, content: newMsg },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      console.log("[DEBUG] Message sent, response:", response.data);
      setMessages(prev => [...prev, response.data]);
      setNewMsg('');
    } catch (err) {
      console.error('Error sending message:', err.response?.data || err.message);
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
