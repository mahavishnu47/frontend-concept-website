import React from 'react';
import styles from './LegalPages.module.css';

function PrivacyPolicy() {
    return (
        <div className={styles.legalPage}>
            <div className={styles.container}>
                <h1>Privacy Policy</h1>
                <div className={styles.content}>
                    <section>
                        <h2>1. Information We Collect</h2>
                        <p>We collect information that you provide directly to us, including:</p>
                        <ul>
                            <li>Account information (name, email, educational details)</li>
                            <li>Learning preferences and activity</li>
                            <li>Community interactions and content</li>
                            <li>Usage data and analytics</li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. How We Use Your Information</h2>
                        <p>We use the collected information to:</p>
                        <ul>
                            <li>Personalize your learning experience</li>
                            <li>Improve our educational content</li>
                            <li>Facilitate community interactions</li>
                            <li>Send important updates and notifications</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Data Protection</h2>
                        <p>We implement industry-standard security measures to protect your personal information and maintain data privacy.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
