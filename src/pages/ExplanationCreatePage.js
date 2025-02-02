import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import LoadingModal from '../components/LoadingModal/LoadingModal';
import styles from './ExplanationCreatePage.module.css';

function ExplanationCreatePage() {
  console.log('ExplanationCreatePage rendering'); // Add this debug log
  const { getApiKey, user } = useContext(AuthContext);
  const [inputValue, setInputValue] = useState('');
  const [createdWebsite, setCreatedWebsite] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form with value:', inputValue); // Add this debug log
    setLoading(true);
    try {
      const apiKey = getApiKey();
      const response = await axios.post(
        `${API_BASE_URL}/websites`,
        { user_id: user.user_id, query: inputValue },
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );
      setCreatedWebsite(response.data);
      setInputValue('');
    } catch (err) {
      console.error('Error creating website:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.explanationCreateContainer}>
      <h2>Create your explanation</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className={styles.explanationTextarea}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your content here"
        />
        <button type="submit" className={styles.explanationButton}>
          Create
        </button>
      </form>
      {loading && <LoadingModal />}
      {createdWebsite && <WebsiteCard website={createdWebsite} />}
    </div>
  );
}

export default ExplanationCreatePage;