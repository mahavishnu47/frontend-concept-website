import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000'; // Update if different

function CommunityChat({ websiteId, user, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${SOCKET_SERVER_URL}/community`, { query: { token: apiKey }, transports: ['websocket'] });
    newSocket.on('connect', () => {
      console.log("DEBUG: Socket connected, id:", newSocket.id);
      // Immediately join the room upon connection
      newSocket.emit('join_room', { room: String(websiteId), user_id: user.user_id });
    });
    newSocket.on('connect_error', (err) => {
      console.error("DEBUG: Socket connection error:", err);
    });
    newSocket.on('disconnect', (reason) => {
      console.log("DEBUG: Socket disconnected:", reason);
    });
    newSocket.on('joined', (data) => {
      console.log("DEBUG: Joined room confirmed:", data);
    });
    newSocket.on('new_message', (message) => {
      console.log("DEBUG: Received new_message event:", message);
      setMessages((prev) => [...prev, message]);
    });
    // Added: Log when socket is attempting to connect
    console.log("DEBUG: Attempting to connect to socket at", `${SOCKET_SERVER_URL}/community`);
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [websiteId, apiKey, user.user_id]);

  const sendMessage = () => {
    if (input.trim() && socket) {
      const msg = { websiteId, user_id: user.user_id, content: input };
      socket.emit('send_message', msg);
      setInput('');
    }
  };

  return (
    <div>
      <h3>Community Chat</h3>
      <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.user_email || msg.user_id}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input 
        type="text" 
        placeholder="Type your message..." 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default CommunityChat;
