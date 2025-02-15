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
  const [pageSize, setPageSize] = useState(4); // Default set to 4

  const fetchWebsites = async () => {
    setLoading(true);
    // Updated: Use fallback empty array when reading cache data
    if (!searchTerm && orderCriteria === 'default') {
      const cache = localStorage.getItem("websitesCache");
      if (cache) {
        const parsed = JSON.parse(cache);
        if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
          setWebsites(parsed.data || []);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem("websitesCache");
        }
      }
    }
    try {
      const apiKey = getApiKey();
      const params = {
        user_id: isAuthenticated && user ? user.user_id : undefined,
        orderCriteria, // pass order criteria
        page: currentPage,
        pageSize: pageSize
      };
      const endpoint = `${API_BASE_URL}/websites/all`;
      const response = await axios.get(endpoint, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        params
      });
      // Ensure websites is always an array even if response shape varies.
      const websitesData = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data.data) ? response.data.data : []);
      setWebsites(websitesData);
      // NEW: Cache the data if no search and default ordering
      if (!searchTerm && orderCriteria === 'default') {
        localStorage.setItem("websitesCache", JSON.stringify({ timestamp: Date.now(), data: websitesData }));
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching websites:', err);
      setError('Failed to load websites');
      setWebsites([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch websites when page, pageSize, or order criteria changes
  useEffect(() => {
    fetchWebsites();
  }, [currentPage, pageSize, orderCriteria]);

  // Add websiteDeleted event listener
  useEffect(() => {
    window.addEventListener('website-deleted', fetchWebsites);
    return () => {
      window.removeEventListener('website-deleted', fetchWebsites);
    };
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
  // Updated: Guard against undefined websites in filter
  const filteredWebsites = (websites || []).filter(website => 
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
  const totalPages = Math.ceil(orderedWebsites.length / pageSize);
  const indexOfLastWebsite = currentPage * pageSize;
  const indexOfFirstWebsite = indexOfLastWebsite - pageSize;
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
            <div className={styles.pageSizeContainer}>
              <label>Websites per page: </label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
              </select>
            </div>
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
                <button onClick={() => paginate(1)} disabled={currentPage === 1}>
                  First
                </button>
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
                <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>
                  Last
                </button>
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
