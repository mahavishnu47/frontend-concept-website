import React, { useState, useContext, useEffect } from 'react'; // Import useContext and useEffect Hook
import styles from './LoginPage.module.css';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

function LoginPage({ user, loginFunction }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useContext(AuthContext); // Use useContext to access login and loading from AuthContext
  const navigate = useNavigate();

  useEffect(() => {
    // If the logged-in user is admin, redirect automatically to the admin page.
    if (user && user.is_admin === 1) {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const loginData = { email, password }; // Prepare login data
    const { success, error: loginError } = await login(loginData); // Call login function from AuthContext

    if (!success) {
      setError(loginError || 'Login failed.'); // Set error from context or generic message
    } else {
      // Debug: Check the stored API key after login
      const storedToken = localStorage.getItem("authToken");
      console.log("DEBUG: Stored authToken after login:", storedToken);
    }
    // On successful login, AuthContext's login function will handle redirection
  };

  return (
    <div className={styles.loginPage}>
      <section className={styles.loginSection}>
        <div className={styles.loginBox}>
          <h2 className={styles.loginTitle}>Welcome Back!</h2>
          <p className={styles.loginSubtitle}>Login to continue your learning journey.</p>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {loading && <div>Logging in...</div>} {/* Optional loading indicator during login */}

          <form className={styles.loginForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.formInput}
                placeholder="Your Email"
                value={email} // Bind input value to state
                onChange={(e) => setEmail(e.target.value)} // Update state on input change
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.formInput}
                placeholder="Your Password"
                value={password} // Bind input value to state
                onChange={(e) => setPassword(e.target.value)} // Update state on input change
              />
            </div>

            <button type="submit" className={styles.loginButton}>Login</button>
          </form>

          <div className={styles.registerLink}>
            <p>Don't have an account? <Link to="/register" className={styles.link}>Register here</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;