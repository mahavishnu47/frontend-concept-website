import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';
import styles from './AdminConceptUploadPage.module.css'; // New CSS module

const AdminConceptUploadPage = () => {
  const [file, setFile] = useState(null);
  const [grade, setGrade] = useState('');
  const [board, setBoard] = useState('');
  const [subject, setSubject] = useState('');
  const [medium, setMedium] = useState('');
  const [status, setStatus] = useState('');
  const [progressLog, setProgressLog] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [bookTitle, setBookTitle] = useState(""); // new state for book title

  const inputFields = [
    { name: 'grade', label: 'Grade', value: grade, setter: setGrade },
    { name: 'board', label: 'Board', value: board, setter: setBoard },
    { name: 'subject', label: 'Subject', value: subject, setter: setSubject },
    { name: 'medium', label: 'Medium', value: medium, setter: setMedium },
  ];

  const validatePdfFile = (file) => {
    // Check file type using both MIME type and extension
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

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setStatus('Error: PDF file size must be less than 10MB');
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
    if (selectedFile) {
      if (validatePdfFile(selectedFile)) {
        setFile(selectedFile);
        setStatus('PDF file selected: ' + selectedFile.name);
      } else {
        setFile(null);
        e.target.value = ''; // Reset file input
      }
    }
  };

  const handleRemoveFile = () => {
    if (uploadInProgress) {
      setStatus('Cannot remove the file while upload is in progress.');
      return;
    }
    setFile(null);
    setStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploadInProgress) {
      setStatus('Upload already in progress. Please wait.');
      return;
    }
    if (!file) {
      setStatus('Error: Please select a PDF file');
      return;
    }
    
    if (!validatePdfFile(file)) {
      return;
    }
    
    setUploadInProgress(true);
    setProgressLog([]);
    setStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('grade', grade);
    formData.append('board', board);
    formData.append('subject', subject);
    formData.append('medium', medium);
    formData.append('book_title', bookTitle); // include book title

    // Debug: Log token value before sending request
    const storedToken = localStorage.getItem('authToken');
    let tokenValue = '';
    try {
      // Parse the JSON token string before using it.
      tokenValue = JSON.parse(storedToken).token;
      console.log(tokenValue)
    } catch (err) {
      console.error("Error parsing token:", err);
    }

    try {
      const res = await axios.post(
        API_BASE_URL + '/admin/upload-pdf-concept',
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${tokenValue}` // Removed explicit 'Content-Type'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setStatus(`Uploading: ${percentCompleted}%`);
          },
        }
      );
      console.log('Response received:', res.data);
      setStatus('File uploaded. Processing...');
      simulateProgress();
      // Optionally, use res.data to update final status if backend sends details
      if(res.data && res.data.message) {
        setStatus(res.data.message);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatus(`Error: ${err.message}`);
      setUploadInProgress(false);
    }
  };

  // Simulate real-time progress and estimated time updates
  const simulateProgress = () => {
    const steps = [
      { message: 'Converting PDF to Markdown...', duration: 3000 },
      { message: 'Extracting textbook metadata...', duration: 2000 },
      { message: 'Storing concept in database...', duration: 3000 },
      { message: 'Finalizing upload...', duration: 1000 },
    ];
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setProgressLog((prev) => [...prev, step.message]);
        setEstimatedTime(Math.round(step.duration / 1000));
        currentStep++;
      } else {
        clearInterval(interval);
        setEstimatedTime(0);
        setStatus('Upload and processing complete.');
        setUploadInProgress(false);
      }
    }, 500);
  };

  return (
    <div className={styles.adminPage}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Admin Concept Upload</h1>
          <p className={styles.heroSubtitle}>Upload and process textbook content for student learning</p>
        </div>
      </section>

      <div className={styles.uploadSection}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.uploadForm}>
            <div className={styles.fileInputContainer}>
              {!file ? (
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
                    <span className={styles.fileName}>{file.name}</span>
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
                    Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            <div className={styles.inputGrid}>
              {inputFields.map(field => (
                <div key={field.name} className={styles.inputContainer}>
                  <label htmlFor={field.name} className={styles.inputLabel}>
                    {field.label}
                    <span className={styles.asterisk}>*</span>
                  </label>
                  <input
                    id={field.name}
                    type="text"
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    required
                    disabled={uploadInProgress}
                    className={styles.formInput}
                  />
                </div>
              ))}
              <div className={styles.inputContainer}>
                <label htmlFor="bookTitle" className={styles.inputLabel}>
                  Book Title
                  <span className={styles.asterisk}>*</span>
                </label>
                <input
                  id="bookTitle"
                  type="text"
                  placeholder="Enter book title"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
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
              title={uploadInProgress ? "Cannot upload while another file is being processed" : ""}
            >
              Upload Textbook
            </button>
          </form>
        </div>

        {(status || progressLog.length > 0) && (
          <div className={styles.statusSection}>
            {status && (
              <div className={styles.statusCard}>
                <h3>Upload Status</h3>
                <p className={styles.statusText}>{status}</p>
                {estimatedTime !== null && estimatedTime > 0 && (
                  <p className={styles.estimatedTime}>
                    Estimated time remaining: {estimatedTime} seconds
                  </p>
                )}
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
};

export default AdminConceptUploadPage;
