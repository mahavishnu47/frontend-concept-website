import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import styles from './WebsitesPage.module.css';
import WebsiteCard from '../components/WebsiteCard/WebsiteCard';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';

function WebsitesPage() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderCriteria, setOrderCriteria] = useState('default');
  const { getApiKey, isAuthenticated, user } = useContext(AuthContext);
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
      // NEW: Update each website with the current member_count from its community
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
    <div className={styles.websitesPage}>
      <h2 className={styles.pageTitle}>
        {searchTerm.trim() ? `Search results for "${searchTerm}"` : 'All Websites'}
      </h2>
      {/* Changed: Replaced form with a div to remove submit action */}
      <div className={styles.searchForm}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search by concept name"
          className={styles.searchInput}
        />
        {/* New ordering select */}
        <select value={orderCriteria} onChange={handleOrderChange} className={styles.orderSelect}>
          <option value="default">Default</option>
          <option value="mostLiked">Most Liked</option>
          <option value="mostShared">Most Shared</option>
          <option value="mostMembers">Most Members</option>
          <option value="mostRecent">Most Recent</option>  // NEW: Sort by newest first
          <option value="oldest">Oldest</option>            // NEW: Sort by oldest first
        </select>
      </div>

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
          {/* Pagination Controls */}
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
        <div className={styles.noResults}>No websites found</div>
      )}
    </div>
  );
}

export default WebsitesPage;
