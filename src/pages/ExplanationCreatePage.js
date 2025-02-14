import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import LoadingModal from '../components/LoadingModal/LoadingModal';
import styles from './ExplanationCreatePage.module.css';
import { ThemeContext } from '../context/ThemeContext';

// Add FilterSelect component
function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <select 
      className={styles.filterSelect} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  );
}

function ExplanationCreatePage() {
  console.log('ExplanationCreatePage rendering'); // Add this debug log
  const { getApiKey, user, isAuthenticated } = useContext(AuthContext);
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
  const [showModerationModal, setShowModerationModal] = useState(false); // new state for moderation modal

  // New state for dynamically loaded dropdown options
  const [gradeOptions, setGradeOptions] = useState([]);
  const [boardOptions, setBoardOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  // Updated: Change initial state to empty array for mediumOptions
  const [mediumOptions, setMediumOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setOptionsLoading(true);
      try {
        const apiKey = getApiKey();
        if (!isAuthenticated || !apiKey) return;
        const headers = { 'Authorization': `Bearer ${apiKey}` };
        // Fetch grades, boards, subjects, and mediums from backend
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
    fetchFilterOptions();
  }, [getApiKey, isAuthenticated]);

  // New moderation function using Gemini 2.0 Flash model via backend endpoint
  const moderateContent = async (text) => {
    try {
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/moderate-chat`,
        { text },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      // Assume backend returns { harmful: true/false }
      return response.data.safe;
    } catch (err) {
      console.error('Moderation check failed, defaulting to safe:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // New: Run moderation check first
    const isHarmful = await moderateContent(inputValue);
    if (isHarmful) {
      setShowModerationModal(true);
      return;
    }
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
          <div className={styles.loadingDropdowns}>Loading options...</div>
        ) : (
          <div className={styles.filterGroup}>
            <FilterSelect
              label="Select Grade"
              value={grade}
              onChange={setGrade}
              options={gradeOptions}
              placeholder="Select Grade"
            />
            <FilterSelect
              label="Select Medium"
              value={medium}
              onChange={setMedium}
              options={mediumOptions}
              placeholder="Select Medium"
            />
            <FilterSelect
              label="Select Board"
              value={board}
              onChange={setBoard}
              options={boardOptions}
              placeholder="Select Board"
            />
            <FilterSelect
              label="Select Subject"
              value={subject}
              onChange={setSubject}
              options={subjectOptions}
              placeholder="Select Subject"
            />
          </div>
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

      {/* New: Moderation Modal */}
      {showModerationModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>You are not allowed to search harmful content. Only educational content is permitted.</p>
            <button onClick={() => setShowModerationModal(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExplanationCreatePage;