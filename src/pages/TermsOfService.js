import React from 'react';
import styles from './LegalPages.module.css';

function TermsOfService() {
    return (
        <div className={styles.legalPage}>
            <div className={styles.container}>
                <h1>Terms of Service</h1>
                <div className={styles.content}>
                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing and using this platform, you agree to be bound by these terms and conditions.</p>
                    </section>

                    <section>
                        <h2>2. User Responsibilities</h2>
                        <ul>
                            <li>Maintain accurate account information</li>
                            <li>Respect intellectual property rights</li>
                            <li>Follow community guidelines</li>
                            <li>Use the platform for educational purposes only</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. Content Guidelines</h2>
                        <p>Users must ensure their content:</p>
                        <ul>
                            <li>Is educational and appropriate</li>
                            <li>Does not violate any laws or rights</li>
                            <li>Is accurate and original</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default TermsOfService;
