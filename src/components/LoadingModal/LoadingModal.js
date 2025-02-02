import React, { useState, useEffect } from 'react';
import styles from './LoadingModal.module.css';

const wittyMessages = [
  "🤖 Teaching AI to write HTML... it's like teaching a cat to swim!",
  "🎨 Making your website prettier than a unicorn's Instagram",
  "🔄 Converting coffee into code...",
  "🎵 Teaching robots to dance in CSS animations",
  "🧪 Mixing HTML elements like a mad scientist",
  "🎮 Loading creativity.exe...",
  "🎪 Training circus monkeys to arrange your content",
  "🌈 Sprinkling magical div dust everywhere",
  "🎭 Preparing the digital stage for your content",
  "🎪 Juggling bits and bytes..."
];

function LoadingModal() {
  const [currentMessage, setCurrentMessage] = useState(wittyMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => {
        const currentIndex = wittyMessages.indexOf(prev);
        return wittyMessages[(currentIndex + 1) % wittyMessages.length];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.spinner}></div>
        <p className={styles.message}>{currentMessage}</p>
      </div>
    </div>
  );
}

export default LoadingModal;