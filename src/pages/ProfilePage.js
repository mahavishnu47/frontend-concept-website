import React from 'react';
import styles from './ProfilePage.module.css';

function ProfilePage() {
  return (
    <div className={styles.profilePage}>
      <section className={styles.profileSection}>
        <h2 className={styles.profileTitle}>Your Profile</h2>
        <div className={styles.profileDetails}>
          {/* We'll populate this with user details later */}
          <p>Username: [Username]</p>
          <p>Email: [Email Address]</p>
          {/* Add more profile information here */}
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;