import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './WebsitesPage.module.css';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';

function WebsitesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('conceptName') || '');
  const { getApiKey, isAuthenticated, user } = useContext(AuthContext);

  const fetchWebsites = async (term) => {
    setLoading(true);
    try {
      const apiKey = getApiKey();
      const params = {};
      // New: Add user_id to query parameters if available
      if (isAuthenticated && user) {
        params.user_id = user.user_id;
      }
      let endpoint = '';
      if (term.trim()) {
        endpoint = `${API_BASE_URL}/websites/search?conceptName=${encodeURIComponent(term.trim())}`;
      } else {
        endpoint = `${API_BASE_URL}/websites/all`;
      }
      const response = await axios.get(endpoint, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        params // Added query params with user_id
      });
      
      setWebsites(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching websites:', err);
      setError('Failed to load websites');
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and when searchTerm changes via URL
  useEffect(() => {
    fetchWebsites(searchTerm);
  }, []); // Empty dependency array for initial load only

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ conceptName: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
    await fetchWebsites(searchTerm);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  return (
    <div className={styles.websitesPage}>
      <h2 className={styles.pageTitle}>
        {searchTerm.trim() ? `Websites for "${searchTerm}"` : 'All Websites'}
      </h2>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search by concept name"
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          {searchTerm.trim() ? 'Search' : 'Show All'}
        </button>
      </form>

      {loading ? (
        <div className={styles.loading}>Loading websites...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : websites.length > 0 ? (
        <div className={styles.websitesGrid}>
          {websites.map(website => (
            <WebsiteCard key={website.website_id} website={website} />
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>No websites found</div>
      )}
    </div>
  );
}

export default WebsitesPage;
