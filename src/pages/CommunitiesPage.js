import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import API_BASE_URL from '../config';
import { Link } from 'react-router-dom';
import styles from './CommunitiesPage.module.css';
import { ThemeContext } from '../context/ThemeContext';

function CommunitiesPage() {
  const { user, getApiKey } = useContext(AuthContext);
  const { isDarkMode } = useContext(ThemeContext);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderCriteria, setOrderCriteria] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  useEffect(() => {
    async function fetchCommunities() {
      if (!user) { 
        console.error("User is not available in CommunitiesPage useEffect");
        return;
      }
      try {
        setLoading(true);
        const apiKey = getApiKey();
        const response = await axios.get(
          `${API_BASE_URL}/users/${user.user_id}/communities`,
          { 
            headers: { 'Authorization': `Bearer ${apiKey}` },
            params: { joined: true }
          }
        );
        
        console.log("Fetched communities:", response.data);
        
        if (Array.isArray(response.data)) {
          setCommunities(response.data);
        } else if (response.data.communities) {
          setCommunities(response.data.communities);
        } else {
          console.error("Unexpected response format:", response.data);
          setCommunities([]);
        }
      } catch (err) {
        console.error('Error fetching communities:', err.response || err);
        setError('Failed to load communities. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchCommunities();
    }
  }, [user, getApiKey]);

  const openLeaveModal = (community) => {
    setSelectedCommunity(community);
    setShowLeaveModal(true);
  };

  const handleLeaveCommunity = async () => {
    if (!selectedCommunity || !user) return;
    try {
      const apiKey = getApiKey();
      await axios.post(
        `${API_BASE_URL}/communities/${selectedCommunity.website_id}/leave`,
        { user_id: user.user_id },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      setCommunities(communities.filter(c => c.website_id !== selectedCommunity.website_id));
      setShowLeaveModal(false);
    } catch (err) {
      console.error('Error leaving community:', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleOrderChange = (e) => {
    setOrderCriteria(e.target.value);
    setCurrentPage(1);
  };

  const filteredCommunities = communities.filter(community =>
    community.concept_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const orderedCommunities = filteredCommunities.slice().sort((a, b) => {
    switch (orderCriteria) {
      case 'mostMembers':
        return (b.member_count || 0) - (a.member_count || 0);
      case 'mostRecent':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(orderedCommunities.length / pageSize);
  const indexOfLastCommunity = currentPage * pageSize;
  const indexOfFirstCommunity = indexOfLastCommunity - pageSize;
  const currentCommunities = orderedCommunities.slice(indexOfFirstCommunity, indexOfLastCommunity);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className={styles.loading}>Loading communities...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (communities.length === 0) {
    return (
      <div className={`${styles.communitiesPage} ${isDarkMode ? 'darkMode' : ''}`}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Your Learning Communities</h1>
          <p className={styles.heroSubtitle}>Connect, collaborate, and learn together</p>
        </section>
        
        <div className={styles.emptyCommunities}>
          <h2>No Communities Joined Yet</h2>
          <p>Start by exploring interests that match your learning goals!</p>
          <Link to="/websites" className={styles.exploreButton}>
            Find Your Tribe
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.communitiesPage} ${isDarkMode ? 'darkMode' : ''}`}>
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Your Learning Communities</h1>
        <p className={styles.heroSubtitle}>Connect, collaborate, and learn together with fellow students</p>
      </section>

      <section className={styles.mainSection}>
        <div className={styles.controlsContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search communities..."
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
              <option value="mostMembers">Most Members</option>
            </select>
            <div className={styles.pageSizeContainer}>
              <label>Communities per page: </label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className={styles.filterSelect}
              >
                {[8, 16, 24].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.resultsSection}>
          {loading ? (
            <div className={styles.loading}>Loading communities...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : currentCommunities.length > 0 ? (
            <>
              <div className={styles.communitiesGrid}>
                {currentCommunities.map(community => (
                  <div key={community.website_id} className={styles.communityCard}>
                    <div className={styles.communityHeader}>
                      <h3 className={styles.communityName}>
                        {community.concept_name || `Community ${community.website_id}`}
                      </h3>
                      <span className={styles.creatorName}>
                        Created by {community.username || 'Anonymous'}
                      </span>
                    </div>
                    <div className={styles.communityStats}>
                      <span className={styles.memberCount}>
                        {community.member_count || 0} members
                      </span>
                    </div>
                    <Link 
                      to={`/communities/${community.website_id}`}
                      className={styles.joinButton}
                    >
                      Enter Community
                    </Link>
                    <button
                      onClick={() => { 
                        console.log("Opening leave modal for", community);
                        openLeaveModal(community);
                      }}
                      className={styles.leaveButton}
                    >
                      Leave Community
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.pagination}>
                <button onClick={() => paginate(1)} disabled={currentPage === 1}>
                  First
                </button>
                {currentPage > 1 && (
                  <button onClick={() => paginate(currentPage - 1)}>Prev</button>
                )}
                {Array.from({ length: Math.min(2, totalPages) }, (_, i) => currentPage + i)
                  .map(pageNum => pageNum <= totalPages && (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={pageNum === currentPage ? styles.activePage : ''}
                    >
                      {pageNum}
                    </button>
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
            <div className={styles.emptyCommunities}>
              <h2>No Communities Found</h2>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </section>

      {showLeaveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>
              Are you sure you want to leave the community "{selectedCommunity?.concept_name || selectedCommunity?.community_name || selectedCommunity?.website_id}"?
            </p>
            <button onClick={handleLeaveCommunity}>Leave Community</button>
            <button onClick={() => setShowLeaveModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommunitiesPage;
