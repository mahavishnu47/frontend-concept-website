import React from 'react';
import styles from './LandingPage.module.css'; // Import CSS Modules from the same directory
import { Link } from 'react-router-dom'; // Import Link for navigation

function LandingPage() {
  return (
    <div className={styles.landingPage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Ignite Your Curiosity, Inspire Your Learning</h1>
          <p className={styles.heroSubtitle}>Discover a new way to learn. Interactive explanations, engaging videos, and a supportive community, all in one place.</p>
          <Link to="/register" className={styles.heroButton}>Get Started for Free</Link>
        </div>
        <div className={styles.heroImage}>
          {/* Replace with your Hero Image or Animation */}
          <img src="/images/hero-illustration.svg" alt="Interactive Learning Illustration" />
          {/* Consider using a dynamic animation or video here for a more eye-catching hero */}
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Unlock the Power of Interactive Learning</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            {/* Replace with your Feature Icon */}
            <div className={styles.featureIcon}><i className="fas fa-lightbulb"></i></div> {/* Example Icon - Font Awesome (you'll need to include Font Awesome) */}
            <h3>Concept Clarity</h3>
            <p>LLM-powered explanations broken down into simple, digestible parts. Understand even the most complex topics with ease.</p>
          </div>
          <div className={styles.featureItem}>
            {/* Replace with your Feature Icon */}
            <div className={styles.featureIcon}><i className="fas fa-video"></i></div> {/* Example Icon - Font Awesome */}
            <h3>Engaging Video Content</h3>
            <p>Curated YouTube videos embedded directly into your learning experience. See concepts in action and learn visually.</p>
          </div>
          <div className={styles.featureItem}>
            {/* Replace with your Feature Icon */}
            <div className={styles.featureIcon}><i className="fas fa-users"></i></div> {/* Example Icon - Font Awesome */}
            <h3>Community Support</h3>
            <p>Join a community of learners. Ask questions, share ideas, and collaborate with peers in our dedicated forums.</p>
          </div>
          <div className={styles.featureItem}>
            {/* Replace with your Feature Icon */}
            <div className={styles.featureIcon}><i className="fas fa-rocket"></i></div> {/* Example Icon - Font Awesome */}
            <h3>Discover New Concepts</h3>
            <p>Explore topics you never knew existed! Our discovery feature helps you find exciting new areas to learn based on popularity and trends.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.sectionTitle}>Ready to Transform Your Learning Experience?</h2>
        <p className={styles.ctaSubtitle}>Join thousands of students who are already learning smarter and achieving more with our platform.</p>
        <Link to="/register" className={styles.ctaButton}>Sign Up for Free Today</Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Educational Platform. All rights reserved.</p>
        <nav>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </nav>
      </footer>
    </div>
  );
}

export default LandingPage;