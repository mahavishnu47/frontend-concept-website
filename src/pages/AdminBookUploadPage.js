import React, { useState } from 'react';
import axios from 'axios';
import styles from './AdminConceptUploadPage.module.css'; // Reuse the same CSS module
import API_BASE_URL from '../config';
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function AdminBookUploadPage() {
  const [title, setTitle] = useState('');
  const [bookFile, setBookFile] = useState(null);
  const [grade, setGrade] = useState('');
  const [board, setBoard] = useState('');
  const [subject, setSubject] = useState('');
  const [medium, setMedium] = useState('');
  const [status, setStatus] = useState('');
  const [progressLog, setProgressLog] = useState([]);
  const [uploadInProgress, setUploadInProgress] = useState(false);

  const validatePdfFile = (file) => {
    const validMimeTypes = ['application/pdf'];
    const validExtensions = ['pdf'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validMimeTypes.includes(file.type)) {
      setStatus('Error: Please upload a valid PDF file');
      return false;
    }
    
    if (!validExtensions.includes(fileExtension)) {
      setStatus('Error: File must have a .pdf extension');
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
        setStatus('Error: PDF file size must be less than 50MB');
        return false;
      }
      return true;
    };
    

  const handleFileChange = (e) => {
    if (uploadInProgress) {
      setStatus('An upload is already in progress. Please wait.');
      return;
    }
    const selectedFile = e.target.files[0];
    if (selectedFile && validatePdfFile(selectedFile)) {
      setBookFile(selectedFile);
      setStatus('PDF file selected: ' + selectedFile.name);
    } else {
      setBookFile(null);
      e.target.value = '';
    }
  };

  const handleRemoveFile = () => {
    if (uploadInProgress) {
      setStatus('Cannot remove the file while upload is in progress.');
      return;
    }
    setBookFile(null);
    setStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadInProgress) {
      setStatus('Upload already in progress. Please wait.');
      return;
    }
    if (!title || !bookFile) {
      setStatus('Error: Please provide both title and PDF file');
      return;
    }
    setUploadInProgress(true);
    setProgressLog([]);
    setStatus('Uploading...');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('book_file', bookFile); // Note the key must match backend expectation
    formData.append('grade', grade);
    formData.append('board', board);
    formData.append('subject', subject);
    formData.append('medium', medium);

    try {
      const res = await axios.post(
        API_BASE_URL + '/admin/books',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setStatus(`Uploading: ${percentCompleted}%`);
          },
        }
      );
      setStatus('File uploaded. Processing...');
      // Simulate progress logs (or handle real-time events if supported)
      const steps = [
        'Converting PDF to Markdown...',
        'Extracting book metadata...',
        'Storing book in database...',
        'Finalizing upload...'
      ];
      steps.forEach((step, idx) => {
        setTimeout(() => {
          setProgressLog(prev => [...prev, step]);
          if (idx === steps.length - 1) {
            setStatus('Upload and processing complete.');
            setUploadInProgress(false);
          }
        }, (idx + 1) * 1000);
      });
    } catch (err) {
      setStatus(`Error: ${err.message}`);
      setUploadInProgress(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Admin Book Upload</h1>
          <p className={styles.heroSubtitle}>Upload a PDF book and process its content</p>
        </div>
      </section>
      <div className={styles.uploadSection}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            <div className={styles.inputContainer}>
              <label htmlFor="title" className={styles.inputLabel}>
                Book Title<span className={styles.asterisk}>*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter book title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={uploadInProgress}
                className={styles.formInput}
              />
            </div>
            <div className={styles.fileInputContainer}>
              {!bookFile ? (
                <label className={styles.fileInputLabel}>
                  <span className={styles.uploadIcon}>📄</span>
                  <span className={styles.requiredField}>
                    Select PDF File (Max 50MB)
                    <span className={styles.asterisk}>*</span>
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    required
                    disabled={uploadInProgress}
                    className={styles.fileInput}
                  />
                  <p className={styles.fileHint}>Only PDF files are allowed</p>
                </label>
              ) : (
                <div className={styles.selectedFileContainer}>
                  <div className={styles.pdfPreview}>
                    <span className={styles.pdfIcon}>📎</span>
                    <span className={styles.fileName}>{bookFile.name}</span>
                    <button 
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={uploadInProgress}
                      className={styles.removeFileBtn}
                      aria-label="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                  <p className={styles.fileSize}>
                    Size: {(bookFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
            <div className={styles.inputGrid}>
              <div className={styles.inputContainer}>
                <label htmlFor="grade" className={styles.inputLabel}>
                  Grade<span className={styles.asterisk}>*</span>
                </label>
                <input
                  id="grade"
                  type="text"
                  placeholder="Enter grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  required
                  disabled={uploadInProgress}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="board" className={styles.inputLabel}>
                  Board<span className={styles.asterisk}>*</span>
                </label>
                <input
                  id="board"
                  type="text"
                  placeholder="Enter board"
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  required
                  disabled={uploadInProgress}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="subject" className={styles.inputLabel}>
                  Subject<span className={styles.asterisk}>*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  disabled={uploadInProgress}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.inputContainer}>
                <label htmlFor="medium" className={styles.inputLabel}>
                  Medium<span className={styles.asterisk}>*</span>
                </label>
                <input
                  id="medium"
                  type="text"
                  placeholder="Enter medium"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  required
                  disabled={uploadInProgress}
                  className={styles.formInput}
                />
              </div>
            </div>
            <button 
              type="submit" 
              className={styles.submitButton} 
              disabled={uploadInProgress}
              title={uploadInProgress ? "Upload in progress" : ""}
            >
              Upload Book
            </button>
          </form>
        </div>
        {(status || progressLog.length > 0) && (
          <div className={styles.statusSection}>
            {status && (
              <div className={styles.statusCard}>
                <h3>Upload Status</h3>
                <p className={styles.statusText}>{status}</p>
              </div>
            )}
            {progressLog.length > 0 && (
              <div className={styles.progressCard}>
                <h3>Processing Steps</h3>
                <ul className={styles.progressList}>
                  {progressLog.map((log, idx) => (
                    <li key={idx} className={styles.progressItem}>
                      <span className={styles.checkmark}>✓</span>
                      {log}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookUploadPage;
