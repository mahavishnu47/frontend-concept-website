import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

function ChatPage() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const bookId = 1; // Demo book id
  const userId = "1"; // Demo user id

  // Fetch chat history on mount using GET endpoint with axios
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/book_chat/${bookId}/messages`, { params: { user_id: userId } });
        const messages = res.data;
        // Map messages to { role, text } format based on is_bot flag
        const formatted = messages.map(msg => ({
          role: msg.is_bot ? 'Bot' : 'User',
          text: msg.content
        }));
        setChatHistory(formatted);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    fetchMessages();
  }, [bookId, userId]);

  // Send new message using POST endpoint with axios and update chat history accordingly
  const sendMessage = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/book_chat/${bookId}/message`, {
        message: userInput,
        user_id: userId
      });
      // Append the new user and bot messages to the chat history
      setChatHistory(prev => [
        ...prev,
        { role: 'User', text: userInput },
        { role: 'Bot', text: res.data.bot_reply }
      ]);
      setUserInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div>
      <h2>Chat Test</h2>
      <div>
        {chatHistory.map((msg, index) => (
          <p key={index}><strong>{msg.role}:</strong> {msg.text}</p>
        ))}
      </div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default ChatPage;
