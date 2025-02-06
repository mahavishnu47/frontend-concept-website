import React, { useState, useEffect, useContext } from 'react';
import styles from './ConceptsPage.module.css';
import ConceptCard from '../components/ConceptCard/ConceptCard';
import axios from 'axios';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';

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
    const itemsPerPage = 10;

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
                setLoading(false);
            } catch (error) {
                console.error('Error fetching concepts:', error);
                setError('Failed to load concepts. Please try again later.');
                setLoading(false);
            }
        };

        fetchConcepts();
    }, [getApiKey, isAuthenticated, gradeFilter, boardFilter, subjectFilter]); // Re-fetch when filters change

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

    // Pagination calculation
    const totalPages = Math.ceil(filteredConcepts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentConcepts = filteredConcepts.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div className={styles.loading}>Loading concepts...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.conceptsPage}>
            <section className={styles.conceptsSection}>
                <h2 className={styles.conceptsTitle}>Explore Concepts</h2>
                {/* NEW: Search input field */}
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by concept name"
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filters}>
                    {filterLoading ? (
                        <div>Loading filters...</div>
                    ) : (
                        <>
                            <select 
                                className={styles.filterSelect} 
                                value={gradeFilter} 
                                onChange={(e) => handleFilterChange('grade', e.target.value)}
                            >
                                <option value="">All Grades</option>
                                {grades.map(grade => (
                                    <option key={grade} value={grade}>{grade}</option>
                                ))}
                            </select>

                            <select 
                                className={styles.filterSelect} 
                                value={boardFilter} 
                                onChange={(e) => handleFilterChange('board', e.target.value)}
                            >
                                <option value="">All Boards</option>
                                {boards.map(board => (
                                    <option key={board} value={board}>{board}</option>
                                ))}
                            </select>

                            <select 
                                className={styles.filterSelect} 
                                value={subjectFilter} 
                                onChange={(e) => handleFilterChange('subject', e.target.value)}
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                <div className={styles.conceptsGrid}>
                    {currentConcepts.map(concept => (
                        <ConceptCard key={concept.concept_id} concept={concept} />
                    ))}
                </div>
                {/* NEW: Pagination Controls */}
                <div className={styles.pagination}>
                    {currentPage > 1 && (
                        <button onClick={() => paginate(currentPage - 1)}>Prev</button>
                    )}
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                        pageNumber <= totalPages && (
                            <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                style={{ fontWeight: pageNumber === currentPage ? 'bold' : 'normal' }}
                            >
                                {pageNumber}
                            </button>
                        )
                    ))}
                    {currentPage < totalPages && (
                        <button onClick={() => paginate(currentPage + 1)}>Next</button>
                    )}
                </div>
            </section>
        </div>
    );
}

export default ConceptsPage;