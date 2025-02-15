import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import styles from './AdminBookManagementPage.module.css'; // Create similar CSS module as other admin pages

const AdminBookManagementPage = () => {
  const [books, setBooks] = useState([]);
  const [message, setMessage] = useState('');
  const [updatingBookId, setUpdatingBookId] = useState(null);
  const [deletingBookId, setDeletingBookId] = useState(null);

  // Fetch books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      const token = JSON.parse(localStorage.getItem('authToken'))?.token;
      try {
        const res = await axios.get(API_BASE_URL + '/admin/books', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setBooks(res.data);
      } catch (err) {
        setMessage('Error fetching books');
        console.error(err);
      }
    };
    fetchBooks();
  }, []);

  const handleUpdate = async (book) => {
    const token = JSON.parse(localStorage.getItem('authToken'))?.token;
    setUpdatingBookId(book.book_id);
    try {
      await axios.put(
        `${API_BASE_URL}/admin/books/${book.book_id}`,
        {
          book_title: book.title,
          grade: book.grade,
          board: book.board,
          subject: book.subject,
          medium: book.medium
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage('Book updated successfully');
    } catch (err) {
      setMessage('Error updating book');
      console.error(err);
    }
    setUpdatingBookId(null);
  };

  const handleDelete = async (bookId) => {
    const token = JSON.parse(localStorage.getItem('authToken'))?.token;
    setDeletingBookId(bookId);
    try {
      await axios.delete(`${API_BASE_URL}/admin/books/${bookId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBooks(prevBooks => prevBooks.filter(b => b.book_id !== bookId));
      setMessage('Book deleted successfully');
    } catch (err) {
      setMessage('Error deleting book');
      console.error(err);
    }
    setDeletingBookId(null);
  };

  const handleInputChange = (bookId, field, value) => {
    setBooks(prevBooks =>
      prevBooks.map(book =>
        book.book_id === bookId ? { ...book, [field]: value } : book
      )
    );
  };

  return (
    <div className={styles.adminPage}>
      <h1>Admin Book Management</h1>
      {message && <p className={styles.message}>{message}</p>}
      <table className={styles.bookTable}>
        <thead>
          <tr>
            <th>Book ID</th> {/* New header for book_id */}
            <th>Title</th>
            <th>Grade</th>
            <th>Board</th>
            <th>Subject</th>
            <th>Medium</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.book_id}>
              <td>{book.book_id}</td> {/* Display book_id */}
              <td>
                <input
                  type="text"
                  value={book.title}
                  onChange={(e) => handleInputChange(book.book_id, 'title', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={book.grade}
                  onChange={(e) => handleInputChange(book.book_id, 'grade', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={book.board}
                  onChange={(e) => handleInputChange(book.book_id, 'board', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={book.subject}
                  onChange={(e) => handleInputChange(book.book_id, 'subject', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={book.medium}
                  onChange={(e) => handleInputChange(book.book_id, 'medium', e.target.value)}
                />
              </td>
              <td>
                <button
                  className={styles.updateButton} // Styled per website theme as in LandingPage.js
                  onClick={() => handleUpdate(book)}
                  disabled={updatingBookId === book.book_id || deletingBookId === book.book_id}
                >
                  {updatingBookId === book.book_id ? 'Updating…' : 'Update'}
                </button>
                <button
                  className={styles.deleteButton} // Styled per website theme as in LandingPage.js
                  onClick={() => handleDelete(book.book_id)}
                  disabled={deletingBookId === book.book_id || updatingBookId === book.book_id}
                >
                  {deletingBookId === book.book_id ? 'Deleting…' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookManagementPage;
