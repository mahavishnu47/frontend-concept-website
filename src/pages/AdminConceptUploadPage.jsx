import React, { useState } from 'react';

const AdminConceptUploadPage = () => {
  const [userId, setUserId] = useState('');
  const [filePath, setFilePath] = useState('');
  const [grade, setGrade] = useState('');
  const [board, setBoard] = useState('');
  const [subject, setSubject] = useState('');
  const [medium, setMedium] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      user_id: userId,
      file_path: filePath,
      grade,
      board,
      subject,
      medium
    };
    try {
      const res = await fetch(process.env.REACT_APP_API_URL + '/admin/upload-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`Success: ${data.count} concepts stored`);
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="explanationCreateContainer">
      <h1>Admin Concept Upload</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Admin User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Markdown File Path"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <input
          type="text"
          placeholder="Board"
          value={board}
          onChange={(e) => setBoard(e.target.value)}
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="Medium"
          value={medium}
          onChange={(e) => setMedium(e.target.value)}
        />
        <button type="submit" className="explanationButton">
          Upload Concept
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default AdminConceptUploadPage;
