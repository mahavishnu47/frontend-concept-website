import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

function BooksChatPage() {
  const [bookTree, setBookTree] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const userId = "1"; // Demo user id

  // Fetch book data and construct tree from Books table
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/book_chat/books`);
        const books = res.data; // assuming each book has properties: grade, subject, and id in some form
        const tree = {};
        books.forEach(book => {
          const grade = book.grade || "Unknown";
          const subject = book.subject || "Unknown";
          // Updated: capture book id from the available fields
          const bookId = book.bookId || book.book_id || book.id;
          if (!tree[grade]) {
            tree[grade] = [];
          }
          // Ensure unique entries by subject and bookId within a grade
          if (!tree[grade].some(item => item.subject === subject && item.bookId === bookId)) {
            tree[grade].push({ subject, bookId });
          }
        });
        setBookTree(tree);
      } catch (err) {
        console.error("Error fetching book tree:", err);
      }
    };
    fetchBooks();
  }, []);

  // Fetch chat history once a book is selected
  useEffect(() => {
    if (selectedBook) {
      const fetchMessages = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/book_chat/${selectedBook.bookId}/messages`, {
            params: { user_id: userId }
          });
          const formatted = res.data.map(msg => ({
            role: msg.is_bot ? 'Bot' : 'User',
            text: msg.content
          }));
          setChatHistory(formatted);
        } catch (err) {
          console.error('Error fetching messages:', err);
        }
      };
      fetchMessages();
    }
  }, [selectedBook, userId]);

  // Send message for the selected book
  const sendMessage = async () => {
    if (!selectedBook || !userInput.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/book_chat/${selectedBook.bookId}/message`, {
        message: userInput,
        user_id: userId
      });
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
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Dropdown tree panel */}
      <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '1rem', overflowY: 'auto' }}>
        <h3>Select a Grade & Subject</h3>
        {Object.keys(bookTree).length > 0 ? (
          Object.keys(bookTree).map(grade => (
            <div key={grade}>
              <strong>{grade}</strong>
              <ul>
                {bookTree[grade].map(item => (
                  <li key={item.bookId}>
                    <button
                      style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
                      onClick={() => setSelectedBook({ bookId: item.bookId, subject: item.subject, grade })}
                    >
                      {item.subject}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>Loading books...</p>
        )}
      </div>
      {/* Chat window panel */}
      <div style={{ width: '70%', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        {selectedBook ? (
          <>
            <h3>Chat about {selectedBook.grade} - {selectedBook.subject}</h3>
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
              {chatHistory.length > 0 ? (
                chatHistory.map((msg, index) => (
                  <p key={index}><strong>{msg.role}:</strong> {msg.text}</p>
                ))
              ) : (
                <p>No previous messages.</p>
              )}
            </div>
            <div>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter your message..."
                style={{ width: '80%', padding: '0.5rem' }}
              />
              <button onClick={sendMessage} style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>Send</button>
            </div>
          </>
        ) : (
          <p>Please select a grade and subject to start chatting.</p>
        )}
      </div>
    </div>
  );
}

export default BooksChatPage;
