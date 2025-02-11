import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { AuthContext } from '../context/AuthContext';

function LandingPage() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const renderActionButtons = () => {
    if (user) {
      return isAdmin ? (
        <Link to="/admin/upload" className={styles.ctaButton}>
          Upload Now
        </Link>
      ) : (
        <Link to="/create" className={styles.ctaButton}>
          Understand Now
        </Link>
      );
    }

    return (
      <div className={styles.ctaButtons}>
        <Link to="/register" className={styles.primaryButton}>
          Get Started Free
        </Link>
        <Link to="/login" className={styles.secondaryButton}>
          Login
        </Link>
      </div>
    );
  };

  return (
    <div className={styles.landingPage}>
      <section className={styles.heroSection}>
        <div className={`${styles.heroContent} ${styles.lightText}`}>
          <h1 className={styles.heroTitle}>
            Ignite Your Curiosity, Inspire Your Learning
          </h1>
          <p className={styles.heroSubtitle}>
            Discover a new way to learn through interactive explanations, engaging videos, and a supportive community.
          </p>
          {renderActionButtons()}
        </div>
      </section>

      <section className={styles.featuresSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Why Choose Us</h2>
          <div className={styles.featuresGrid}>
            <div className={`${styles.featureCard} ${styles.darkText}`}>
              <div className={styles.featureIcon}>🎯</div>
              <h3>Concept Clarity</h3>
              <p>AI-powered explanations that break down complex topics into simple, digestible parts.</p>
            </div>

            <div className={`${styles.featureCard} ${styles.darkText}`}>
              <div className={styles.featureIcon}>🎬</div>
              <h3>Visual Learning</h3>
              <p>Curated educational videos that bring concepts to life through animation and visualization.</p>
            </div>

            <div className={`${styles.featureCard} ${styles.darkText}`}>
              <div className={styles.featureIcon}>👥</div>
              <h3>Community Support</h3>
              <p>Join discussion groups, share insights, and learn together with peers.</p>
            </div>

            <div className={`${styles.featureCard} ${styles.darkText}`}>
              <div className={styles.featureIcon}>🚀</div>
              <h3>Personalized Path</h3>
              <p>Learning experiences tailored to your grade, board, and medium of instruction.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={`${styles.sectionContainer} ${styles.darkText}`}>
          <h2 className={styles.sectionTitle}>Ready to Transform Your Learning?</h2>
          <p className={styles.ctaText}>
            {user 
              ? 'Start creating and exploring learning content now!'
              : 'Join thousands of students who are already learning smarter with our platform.'}
          </p>
          {renderActionButtons()}
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Educational Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;