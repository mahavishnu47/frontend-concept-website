import React, { useContext } from 'react';
import styles from '../components/NavBar.module.css';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user } = useContext(AuthContext); // No need to get logout here anymore

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/" className={styles.logoLink}>Educational Platform</Link>
      </div>
      <ul className={styles.navLinks}>
        {isAuthenticated ? ( // Conditionally render links if authenticated
          <>
            {/* Removed Profile Link from here */}
            <li>
              <Link to="/concepts" className={styles.navLink}>Concepts</Link>
            </li>
            <li>
              <Link to="/websites" className={styles.navLink}>Websites</Link>
            </li>
            <li>
              <Link to="/communities" className={styles.navLink}>Communities</Link> {/* New link */}
            </li>
            <li>
              <Link to="/create-explanation" className={styles.navLink}>Create Explanation</Link>
            </li>
            {isAuthenticated && user?.is_admin && (
              <li>
                <Link to="/admin/upload-concept" className={styles.navLink}>
                  Admin Upload
                </Link>
              </li>
            )}
            {/* Removed Logout Button from here */}
          </>
        ) : ( // Conditionally render links if NOT authenticated
          <>
            <li>
              <Link to="/login" className={styles.navLink}>Login</Link>
            </li>
            <li>
              <Link to="/register" className={styles.navLink}>Register</Link>
            </li>
          </>
        )}
      </ul>
      {isAuthenticated && user && ( // Conditionally display user greeting as a Link to Profile
        <div className={styles.userGreeting}>
          <Link to="/profile" className={styles.greetingLink}> {/* Wrap greeting in Link */}
            Welcome, {user.username} !
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;