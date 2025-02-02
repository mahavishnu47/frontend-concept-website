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
    const [gradeFilter, setGradeFilter] = useState('');
    const [boardFilter, setBoardFilter] = useState('');
    const [subjectFilter, setsubjectFilter] = useState('');
    const { getApiKey, isAuthenticated } = useContext(AuthContext);

    // New states for filter options
    const [grades, setGrades] = useState([]);
    const [boards, setBoards] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filterLoading, setFilterLoading] = useState(true);

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
    };


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
                    {concepts.map(concept => (
                        <ConceptCard key={concept.concept_id} concept={concept} />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default ConceptsPage;