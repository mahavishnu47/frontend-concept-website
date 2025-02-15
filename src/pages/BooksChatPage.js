import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { default as ReactMarkdown } from 'react-markdown'; // Add ReactMarkdown import
import API_BASE_URL from '../config';
import { ThemeContext } from '../context/ThemeContext';
import styles from './BooksChatPage.module.css';

function BooksChatPage() {
  const [bookTree, setBookTree] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const userId = "1"; // Demo user id
  const { isDarkMode } = useContext(ThemeContext);
  const [expandedGrades, setExpandedGrades] = useState({});
  const messagesEndRef = React.useRef(null);

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

  // Add toggle function for grades
  const toggleGrade = (grade) => {
    setExpandedGrades(prev => ({
      ...prev,
      [grade]: !prev[grade]
    }));
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  return (
    <div className={`${styles.chatPage} ${isDarkMode ? 'darkMode' : ''}`}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Interactive Book Discussions
        </h1>
        <p className={styles.heroSubtitle}>
          Select a book and start an AI-powered conversation about its contents
        </p>
      </section>

      <div className={styles.mainSection}>
        <div className={styles.contentContainer}>
          {/* Books Tree Panel */}
          <div className={styles.booksPanel}>
            <h2 className={styles.panelTitle}>Select a Book</h2>
            <div className={styles.treeContainer}>
              {Object.keys(bookTree).length > 0 ? (
                Object.keys(bookTree).map(grade => (
                  <div key={grade} className={`${styles.gradeSection} ${expandedGrades[grade] ? styles.expanded : ''}`}>
                    <button 
                      className={styles.gradeToggle}
                      onClick={() => toggleGrade(grade)}
                    >
                      <span className={styles.toggleIcon}>
                        {expandedGrades[grade] ? '−' : '+'}
                      </span>
                      <h3 className={styles.gradeTitle}>{grade}</h3>
                    </button>
                    <ul className={`${styles.subjectList} ${expandedGrades[grade] ? styles.expanded : ''}`}>
                      {bookTree[grade].map(item => (
                        <li key={item.bookId}>
                          <button
                            className={`${styles.subjectButton} ${
                              selectedBook?.bookId === item.bookId ? styles.selected : ''
                            }`}
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
                <div className={styles.loading}>Loading books...</div>
              )}
            </div>
          </div>

          {/* Updated Chat Panel */}
          <div className={styles.chatPanel}>
            {selectedBook ? (
              <>
                <div className={styles.chatHeader}>
                  <h2 className={styles.chatTitle}>
                    {selectedBook.grade} - {selectedBook.subject}
                  </h2>
                </div>
                <div className={styles.messagesWrapper}>
                  <div className={styles.messagesContainer}>
                    {chatHistory.length > 0 ? (
                      chatHistory.map((msg, index) => (
                        <div
                          key={index}
                          className={`${styles.message} ${
                            msg.role === 'Bot' ? styles.botMessage : styles.userMessage
                          }`}
                        >
                          {msg.role === 'Bot' ? (
                            <ReactMarkdown className={styles.markdownContent}>
                              {msg.text}
                            </ReactMarkdown>
                          ) : (
                            <p className={styles.messageText}>{msg.text}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        No previous messages. Start a conversation!
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                <form className={styles.messageForm} onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}>
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    className={styles.messageInput}
                  />
                  <button type="submit" className={styles.sendButton}>
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.placeholderState}>
                <h3>Welcome to Book Discussions!</h3>
                <p>Please select a grade and subject to start chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BooksChatPage;
