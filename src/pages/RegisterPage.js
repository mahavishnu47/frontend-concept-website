import React, { useState, useContext } from 'react'; // Import useContext Hook
import styles from './RegisterPage.module.css';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext <---- IMPORT HERE

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register, loading } = useContext(AuthContext); // Use useContext to access register and loading from AuthContext <---- USE CONTEXT HERE


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const registrationData = { username, email, password }; // Prepare registration data
    const { success, error: registrationError } = await register(registrationData); // Call register function from AuthContext

     if (!success) {
      setError(registrationError || 'Registration failed.'); // Set error from context or generic message
    } else {
      setSuccessMessage('Registration successful! You can now login.'); // Success message managed here if needed
       // Optionally clear the form on successful registration
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
    // On successful registration, AuthContext's register function will handle redirection
  };

  return (
    <div className={styles.registerPage}>
      <section className={styles.registerSection}>
        <div className={styles.registerBox}>
          <h2 className={styles.registerTitle}>Create Your Account</h2>
          <p className={styles.registerSubtitle}>Join our community and start your learning journey today!</p>

          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}
          {loading && <div className={styles.loading}>Registering...</div>} {/* Optional loading indicator during registration */}


          <form className={styles.registerForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.formLabel}>Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className={styles.formInput}
                placeholder="Your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required // Added required attribute for HTML5 validation
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.formInput}
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required // Added required attribute for HTML5 validation
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.formInput}
                placeholder="Create a Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required // Added required attribute for HTML5 validation
                minLength="6" // Example: Minimum password length
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={styles.formInput}
                placeholder="Confirm Your Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required // Added required attribute for HTML5 validation
              />
            </div>

            <button type="submit" className={styles.registerButton} disabled={loading}>Register</button> {/* Disable button while loading */}
          </form>

          <div className={styles.loginLink}>
            <p>Already have an account? <Link to="/login" className={styles.link}>Login here</Link></p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;