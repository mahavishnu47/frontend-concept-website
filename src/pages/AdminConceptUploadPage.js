import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

const AdminConceptUploadPage = () => {
  const [file, setFile] = useState(null);
  const [grade, setGrade] = useState('');
  const [board, setBoard] = useState('');
  const [subject, setSubject] = useState('');
  const [medium, setMedium] = useState('');
  const [status, setStatus] = useState('');
  const [progressLog, setProgressLog] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension === 'pdf') {
        setFile(selectedFile);
      } else {
        setStatus('Please select a valid PDF file.');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus('No file selected');
      return; 
    }
    setProgressLog([]);
    setStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('grade', grade);
    formData.append('board', board);
    formData.append('subject', subject);
    formData.append('medium', medium);

    // Debug: Log token value before sending request
    const token = localStorage.getItem('authToken');
    console.log("Token from storage:", token);

    try {
      const res = await axios.post(
        API_BASE_URL + '/admin/upload-pdf-concept',
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
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
      }
    }, 1000);
  };

  return (
    <div className="adminConceptUploadContainer">
      <h1>Admin Concept Upload</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* File input for PDF only */}
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />
        <input
          type="text"
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Board"
          value={board}
          onChange={(e) => setBoard(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Medium"
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
          required
        />
        <button type="submit">Upload Textbook</button>
      </form>
      <div className="status">
        <p>{status}</p>
        {estimatedTime !== null && estimatedTime > 0 && (
          <p>Estimated time remaining for current step: {estimatedTime} seconds</p>
        )}
        {progressLog.length > 0 && (
          <ul>
            {progressLog.map((log, idx) => (
              <li key={idx}>{log}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminConceptUploadPage;
