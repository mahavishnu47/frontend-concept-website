import React from 'react';
import  styles from '../components/NavBar.module.css';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/" className={styles.logoLink}>Educational Platform</Link>
      </div>
      <ul className={styles.navLinks}>
        <li>
          <Link to="/profile" className={styles.navLink}>Profile</Link>
        </li>
        <li>
          <Link to="/concepts" className={styles.navLink}>Concepts</Link>
        </li>
        <li>
          <Link to="/concepts" className={styles.navLink}>Learn New</Link> {/* Initially link to Concepts page */}
        </li>
        {/* Add more navigation links here */}
      </ul>
    </nav>
  );
}

export default Navbar;