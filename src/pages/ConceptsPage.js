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
    const [syllabusFilter, setSyllabusFilter] = useState('');
    const { getApiKey, isAuthenticated } = useContext(AuthContext);

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
                if (syllabusFilter) params.syllabus = syllabusFilter;

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
    }, [getApiKey, isAuthenticated, gradeFilter, boardFilter, syllabusFilter]); // Re-fetch when filters change

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'grade') setGradeFilter(value);
        else if (filterType === 'board') setBoardFilter(value);
        else if (filterType === 'syllabus') setSyllabusFilter(value);
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
                    <select className={styles.filterSelect} value={gradeFilter} onChange={(e) => handleFilterChange('grade', e.target.value)}>
                        <option value="">All Grades</option>
                        <option value="9">Grade 9</option>
                        <option value="10">Grade 10</option>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                        {/* Add more grades as needed */}
                    </select>

                    <select className={styles.filterSelect} value={boardFilter} onChange={(e) => handleFilterChange('board', e.target.value)}>
                        <option value="">All Boards</option>
                        <option value="CBSE">CBSE</option>
                        {/* Add more boards as needed */}
                    </select>

                    <select className={styles.filterSelect} value={syllabusFilter} onChange={(e) => handleFilterChange('syllabus', e.target.value)}>
                        <option value="">All Syllabi</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="Computer Science">Computer Science</option>
                        {/* Add more syllabi as needed */}
                    </select>
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