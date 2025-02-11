import React, { useState, useEffect, useContext } from 'react';
import styles from './ConceptsPage.module.css';
import ConceptCard from '../components/ConceptCard/ConceptCard';
import axios from 'axios';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';

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

function PaginationControls({ currentPage, totalPages, paginate }) {
  return (
    <nav className={styles.pagination} aria-label="Concepts pagination">
      <button 
        onClick={() => paginate(1)} 
        disabled={currentPage === 1}
        aria-label="Go to first page"
      >
        First
      </button>
      {currentPage > 1 && (
        <button 
          onClick={() => paginate(currentPage - 1)}
          aria-label="Go to previous page"
        >
          Prev
        </button>
      )}
      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
        const pageNum = currentPage + i;
        return pageNum <= totalPages && (
          <button
            key={pageNum}
            onClick={() => paginate(pageNum)}
            aria-current={pageNum === currentPage ? "page" : undefined}
            aria-label={`Page ${pageNum}`}
          >
            {pageNum}
          </button>
        );
      })}
      {currentPage + 3 < totalPages && (
        <>
          <span aria-hidden="true">...</span>
          <button 
            onClick={() => paginate(totalPages)}
            aria-label={`Page ${totalPages}`}
          >
            {totalPages}
          </button>
        </>
      )}
      {currentPage < totalPages && (
        <button 
          onClick={() => paginate(currentPage + 1)}
          aria-label="Go to next page"
        >
          Next
        </button>
      )}
      <button 
        onClick={() => paginate(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Go to last page"
      >
        Last
      </button>
    </nav>
  );
}

function ConceptsPage() {
    const [concepts, setConcepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // NEW: search state
    const [gradeFilter, setGradeFilter] = useState('');
    const [boardFilter, setBoardFilter] = useState('');
    const [subjectFilter, setsubjectFilter] = useState('');
    const { getApiKey, isAuthenticated } = useContext(AuthContext);

    // New states for filter options
    const [grades, setGrades] = useState([]);
    const [boards, setBoards] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filterLoading, setFilterLoading] = useState(true);

    // NEW: Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    // NEW: Add pageSize state defaulting to 8
    const [pageSize, setPageSize] = useState(8);

    useEffect(() => {
        const fetchConcepts = async () => {
            setLoading(true);
            setError(null);
            try {
                const apiKey = getApiKey();
                if (!isAuthenticated || !apiKey) {
                    setError("Not authenticated or API key missing.");
                    setLoading(false);
                    return;
                }

                // NEW: Use cache only if no filter/search is applied
                const noFilters = !gradeFilter && !boardFilter && !subjectFilter && !searchTerm;
                if (noFilters) {
                    const cache = localStorage.getItem("conceptsCache");
                    if (cache) {
                        const parsed = JSON.parse(cache);
                        if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
                            setConcepts(parsed.data);
                            setLoading(false);
                            return;
                        } else {
                            localStorage.removeItem("conceptsCache");
                        }
                    }
                }

                const params = {};
                if (gradeFilter) params.grade = gradeFilter;
                if (boardFilter) params.board = boardFilter;
                if (subjectFilter) params.subject = subjectFilter;

                const response = await axios.get(`${API_BASE_URL}/concepts`, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    },
                    params: params // Add query parameters for filtering
                });
                setConcepts(response.data);
                // NEW: Cache concepts only if no filters/search are applied
                if (noFilters) {
                    try {
                        localStorage.setItem("conceptsCache", JSON.stringify({ timestamp: Date.now(), data: response.data }));
                    } catch (e) {
                        console.error("Error caching concepts:", e);
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching concepts:', error);
                setError('Failed to load concepts. Please try again later.');
                setLoading(false);
            }
        };

        fetchConcepts();
    }, [getApiKey, isAuthenticated, gradeFilter, boardFilter, subjectFilter, searchTerm]); // Re-fetch when filters change

    // Fetch filter options
    useEffect(() => {
        const fetchFilterOptions = async () => {
            setFilterLoading(true);
            try {
                const apiKey = getApiKey();
                if (!isAuthenticated || !apiKey) return;

                const headers = { 'Authorization': `Bearer ${apiKey}` };

                // Fetch all filter options at once
                const [gradesRes, boardsRes, subjectsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/grades`, { headers }),
                    axios.get(`${API_BASE_URL}/boards`, { headers }),
                    axios.get(`${API_BASE_URL}/subjects`, { headers })
                ]);

                setGrades(gradesRes.data);
                setBoards(boardsRes.data);
                setSubjects(subjectsRes.data);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
            setFilterLoading(false);
        };

        fetchFilterOptions();
    }, [getApiKey, isAuthenticated]); // Remove dependencies that trigger reloads

    const handleFilterChange = (filterType, value) => {
        switch(filterType) {
            case 'grade':
                setGradeFilter(value);
                break;
            case 'board':
                setBoardFilter(value);
                break;
            case 'subject':
                setsubjectFilter(value);
                break;
            default:
                break;
        }
        setCurrentPage(1);
    };

    // NEW: Update search term on input change and reset pagination
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Combine search and filters: filter locally by concept name
    const filteredConcepts = concepts.filter(concept =>
        (!searchTerm || concept.conceptName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Update totalPages calculation using pageSize
    const totalPages = Math.ceil(filteredConcepts.length / pageSize);
    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentConcepts = filteredConcepts.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className={styles.conceptsPage}>
            {/* Hero Section styled like WebsitesPage */}
            <section className={styles.heroSection} aria-labelledby="pageTitle">
                <h1 id="pageTitle" className={styles.heroTitle}>
                    Educational Concepts Library
                </h1>
                <p className={styles.heroSubtitle}>
                    Explore our comprehensive collection of educational concepts across different subjects and boards
                </p>
            </section>

            <main className={styles.mainSection}>
                {/* Controls Container styled like WebsitesPage */}
                <div className={styles.controlsContainer}>
                    <div className={styles.searchContainer}>
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search concepts..."
                            className={styles.searchInput}
                            aria-label="Search concepts"
                        />
                        {/* Filters aligned horizontally like WebsitesPage */}
                        {!filterLoading && (
                            <div className={styles.filterGroup}>
                                <FilterSelect
                                  label="Filter by grade"
                                  value={gradeFilter}
                                  onChange={(value) => handleFilterChange('grade', value)}
                                  options={grades}
                                  placeholder="All Grades"
                                />
                                <FilterSelect
                                  label="Filter by board"
                                  value={boardFilter}
                                  onChange={(value) => handleFilterChange('board', value)}
                                  options={boards}
                                  placeholder="All Boards"
                                />
                                <FilterSelect
                                  label="Filter by subject"
                                  value={subjectFilter}
                                  onChange={(value) => handleFilterChange('subject', value)}
                                  options={subjects}
                                  placeholder="All Subjects"
                                />
                            </div>
                        )}
                        {/* NEW: Dropdown for number of concepts per page */}
                        <div className={styles.pageSizeContainer}>
                            <label htmlFor="pageSize">Show:</label>
                            <select
                                id="pageSize"
                                value={pageSize}
                                onChange={(e) => {
                                  setPageSize(Number(e.target.value));
                                  setCurrentPage(1);
                                }}
                                className={styles.filterSelect}
                            >
                                {[8, 16, 24].map(size => (
                                  <option key={size} value={size}>
                                    {size} per page
                                  </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className={styles.resultsSection}>
                    {loading ? (
                        <div className={styles.loading} role="status">
                            <span>Loading concepts...</span>
                        </div>
                    ) : error ? (
                        <div className={styles.error} role="alert">
                            {error}
                        </div>
                    ) : currentConcepts.length > 0 ? (
                        <>
                            <div 
                              className={styles.conceptsGrid}
                              role="grid"
                              aria-label="Concepts grid"
                            >
                                {currentConcepts.map(concept => (
                                    <ConceptCard key={concept.concept_id} concept={concept} />
                                ))}
                            </div>
                            
                            {/* UPDATED: Pagination controls with First and Last buttons */}
                            <PaginationControls
                              currentPage={currentPage}
                              totalPages={totalPages}
                              paginate={paginate}
                            />
                        </>
                    ) : (
                        <div className={styles.noResults} role="status">
                            <h3>No concepts found</h3>
                            <p>Try adjusting your search criteria</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default ConceptsPage;