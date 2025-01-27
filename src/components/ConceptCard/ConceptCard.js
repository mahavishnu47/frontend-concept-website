import React from 'react';
import styles from './ConceptCard.module.css';
import { Link } from 'react-router-dom'; // Import Link for navigation

function ConceptCard({ concept }) {
  return (
    <div className={styles.conceptCard}>
      <h3 className={styles.conceptName}>{concept.conceptName}</h3>
      <p className={styles.conceptGrade}>Grade: {concept.grade}</p>
      <p className={styles.conceptSyllabus}>Syllabus: {concept.syllabus}</p>
      <p className={styles.conceptTopic}>Topic: {concept.topic}</p>
      {/* You can add more details or customize the display as needed */}
      <Link to={`/concept/${concept.concept_id}`} className={styles.learnButton}>Learn More</Link>
    </div>
  );
}

export default ConceptCard;