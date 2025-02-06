import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import LoadingModal from '../components/LoadingModal/LoadingModal';
import styles from './ExplanationCreatePage.module.css';
import { ThemeContext } from '../context/ThemeContext';

function ExplanationCreatePage() {
  console.log('ExplanationCreatePage rendering'); // Add this debug log
  const { getApiKey, user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [inputValue, setInputValue] = useState('');
  const [createdWebsite, setCreatedWebsite] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // New state variables for extra details and modal control
  const [grade, setGrade] = useState('');
  const [medium, setMedium] = useState('');
  const [board, setBoard] = useState('');
  const [subject, setSubject] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // New state for dynamically loaded dropdown options
  const [gradeOptions, setGradeOptions] = useState([]);
  const [boardOptions, setBoardOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [mediumOptions, setMediumOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const apiKey = getApiKey();
        const headers = { Authorization: `Bearer ${apiKey}` };
        const [gradesRes, boardsRes, subjectsRes, mediumsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/grades`, { headers }),
          axios.get(`${API_BASE_URL}/boards`, { headers }),
          axios.get(`${API_BASE_URL}/subjects`, { headers }),
          axios.get(`${API_BASE_URL}/mediums`, { headers })
        ]);
        setGradeOptions(gradesRes.data);
        setBoardOptions(boardsRes.data);
        setSubjectOptions(subjectsRes.data);
        setMediumOptions(mediumsRes.data);
      } catch (e) {
        console.error('Error loading dropdown options:', e);
      }
      setOptionsLoading(false);
    };
    fetchOptions();
  }, [getApiKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if any extra info is missing
    if (!grade || !medium || !board || !subject) {
      setShowDetailsModal(true);
      return;
    }
    await submitForm();
  };

  const submitForm = async () => {
    console.log('Submitting form with value:', inputValue);
    setLoading(true);
    try {
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/websites`,
        { 
          user_id: user.user_id, 
          query: inputValue,
          grade,
          medium,
          board,
          subject,
        },
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      setCreatedWebsite(response.data.data);
      console.log('Created website:', response.data.data);
      setInputValue('');
    } catch (err) {
      console.error('Error creating website:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalChoice = (choice) => {
    // If user wants to add details, hide modal and let them update dropdowns
    if (choice === 'add') {
      setShowDetailsModal(false);
    }
    // If user chooses skip, close modal and submit with current (possibly empty) details
    if (choice === 'skip') {
      setShowDetailsModal(false);
      submitForm();
    }
  };

  return (
    <div className={`${styles.explanationCreateContainer} ${isDarkMode ? 'darkMode' : ''}`}>
      <h2>Create your explanation</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className={styles.explanationTextarea}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your content here"
        />
        {/* Render dropdowns dynamically */}
        {optionsLoading ? (
          <p>Loading options...</p>
        ) : (
          <>
            <select value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">Select Grade</option>
              {gradeOptions.map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
            <select value={medium} onChange={(e) => setMedium(e.target.value)}>
              <option value="">Select Medium</option>
              {mediumOptions.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>
            <select value={board} onChange={(e) => setBoard(e.target.value)}>
              <option value="">Select Board</option>
              {boardOptions.map((b, i) => (
                <option key={i} value={b}>{b}</option>
              ))}
            </select>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Select Subject</option>
              {subjectOptions.map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
          </>
        )}
        <button type="submit" className={styles.explanationButton}>Create</button>
      </form>

      {loading && <LoadingModal />}
      {createdWebsite && <WebsiteCard website={createdWebsite} />}
      
      {/* Non-cancelable modal */}
      {showDetailsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>
              Providing additional details (grade, medium, board, subject) helps us fetch relevant textbook content.
              Would you like to update the information?
            </p>
            <button onClick={() => handleModalChoice('add')}>Provide details</button>
            <button onClick={() => handleModalChoice('skip')}>Skip</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExplanationCreatePage;