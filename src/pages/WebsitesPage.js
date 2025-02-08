import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './WebsitesPage.module.css';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderCriteria, setOrderCriteria] = useState('default');
  const { getApiKey, isAuthenticated, user } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [currentPage, setCurrentPage] = useState(1);
  const websitesPerPage = 10;

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const apiKey = getApiKey();
      const params = {};
      if (isAuthenticated && user) {
        params.user_id = user.user_id;
      }
      const endpoint = `${API_BASE_URL}/websites/all`;
      const response = await axios.get(endpoint, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        params
      });
      const updatedWebsites = await Promise.all(response.data.map(async website => {
        try {
          const commResponse = await axios.get(`${API_BASE_URL}/communities/${website.website_id}`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
          });
          website.member_count = commResponse.data.community.member_count || 0;
        } catch (err) {
          website.member_count = 0;
        }
        return website;
      }));
      setWebsites(updatedWebsites);
      setError(null);
    } catch (err) {
      console.error('Error fetching websites:', err);
      setError('Failed to load websites');
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load only
  useEffect(() => {
    fetchWebsites();
  }, []);

  // Update searchTerm on every keystroke
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset to first page on search change
  };

  // New: update order criteria state on change
  const handleOrderChange = (e) => {
    setOrderCriteria(e.target.value);
    setCurrentPage(1);
  };

  // Derive filtered data from already fetched websites
  const filteredWebsites = websites.filter(website => 
    website.concept_name && website.concept_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Updated: Sort filteredWebsites based on orderCriteria with type conversion
  const orderedWebsites = filteredWebsites.slice().sort((a, b) => {
    if (orderCriteria === 'mostLiked') {
      return Number(b.likeCount || 0) - Number(a.likeCount || 0);
    } else if (orderCriteria === 'mostShared') {
      return Number(b.shareCount || 0) - Number(a.shareCount || 0);
    } else if (orderCriteria === 'mostMembers') {
      return Number(b.member_count || 0) - Number(a.member_count || 0);
    } else if (orderCriteria === 'mostRecent') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (orderCriteria === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    } else {
      return 0; // default: no ordering
    }
  });

  // Pagination calculation on orderedWebsites
  const totalPages = Math.ceil(orderedWebsites.length / websitesPerPage);
  const indexOfLastWebsite = currentPage * websitesPerPage;
  const indexOfFirstWebsite = indexOfLastWebsite - websitesPerPage;
  const currentWebsites = orderedWebsites.slice(indexOfFirstWebsite, indexOfLastWebsite);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`${styles.websitesPage} ${isDarkMode ? 'darkMode' : ''}`}>
      {/* New Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>
          Interactive Learning Websites
        </h1>
        <p className={styles.heroSubtitle}>
          Browse through our collection of interactive educational websites created by our community
        </p>
      </section>

      <section className={styles.mainSection}>
        {/* Controls Container */}
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Search websites..."
              className={styles.searchInput}
            />
            <select 
              value={orderCriteria} 
              onChange={handleOrderChange} 
              className={styles.orderSelect}
            >
              <option value="default">Sort by</option>
              <option value="mostRecent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="mostLiked">Most Liked</option>
              <option value="mostShared">Most Shared</option>
              <option value="mostMembers">Most Members</option>
            </select>
          </div>
        </div>

        {/* Results Section */}
        <div className={styles.resultsSection}>
          {loading ? (
            <div className={styles.loading}>Loading websites...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : currentWebsites.length > 0 ? (
            <>
              <div className={styles.websitesGrid}>
                {currentWebsites.map(website => (
                  <WebsiteCard key={website.website_id} website={website} />
                ))}
              </div>
              
              <div className={styles.pagination}>
                {currentPage > 1 && (
                  <button onClick={() => paginate(currentPage - 1)}>Prev</button>
                )}
                {/* Show next 2 page numbers */}
                {Array.from({ length: 2 }, (_, i) => currentPage + i).map(pageNum => (
                  pageNum <= totalPages && (
                    <button 
                      key={pageNum} 
                      onClick={() => paginate(pageNum)}
                      style={{ fontWeight: pageNum === currentPage ? 'bold' : 'normal' }}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
                {currentPage + 2 < totalPages && (
                  <>
                    <span>...</span>
                    <button onClick={() => paginate(totalPages)}>{totalPages}</button>
                  </>
                )}
                {currentPage < totalPages && (
                  <button onClick={() => paginate(currentPage + 1)}>Next</button>
                )}
              </div>
            </>
          ) : (
            <div className={styles.noResults}>
              <h3>No websites found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default WebsitesPage;
