import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './FullScreenWebsite.module.css';
import API_BASE_URL from '../config';
import { AuthContext } from '../context/AuthContext';

function FullScreenWebsite() {
    const navigate = useNavigate();
    const { website_id } = useParams();
    const [websiteContent, setWebsiteContent] = useState('');
    const [loading, setLoading] = useState(true);
    const { getApiKey } = useContext(AuthContext);

    useEffect(() => {
        console.log('FullScreenWebsite useEffect mounted');
        console.log('Params received:', { website_id });
        const fetchWebsite = async () => {
            try {
                const apiKey = getApiKey();
                console.log('API Key:', apiKey);
                console.log(`Fetching website from: ${API_BASE_URL}/websites/${website_id}`);
                const response = await axios.get(`${API_BASE_URL}/websites/${website_id}`, {
                    headers: { 'Authorization': `Bearer ${apiKey}` }
                });
                console.log('Response received:', response.data);
                setWebsiteContent(response.data.website_code);
            } catch (error) {
                console.error('Error fetching website:', error);
            } finally {
                setLoading(false);
                console.log('Loading set to false');
            }
        };

        fetchWebsite();
    }, [website_id, getApiKey]);

    const handleClose = () => {
        console.log('Closing website view');
        navigate('/websites');
    };

    if (loading) {
        console.log('Component loading...');
        return <div className={styles.loading}>Loading website...</div>;
    }

    console.log('Rendering website content');

    return (
        <div className={styles.fullscreenContainer}>
            <button 
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close website"
            >
                ×
            </button>
            <iframe
                srcDoc={websiteContent}
                className={styles.websiteFrame}
                title="Educational Website"
                sandbox="allow-scripts allow-same-origin allow-popups"
                frameBorder="0"
                allowFullScreen
                style={{
                    width: '100%',
                    height: '100vh',
                    border: 'none',
                    overflow: 'hidden'
                }}
            />
        </div>
    );
}

export default FullScreenWebsite;