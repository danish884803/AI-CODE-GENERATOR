import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Login from './Login';
import axios from 'axios';
import './App.css'; // Import the custom CSS

const ENDPOINT = process.env.REACT_APP_API_URL;
function App() {
  const [token, setToken] = useState('');
  const [socket, setSocket] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');

  useEffect(() => {
    if (token) {
      const sock = io(ENDPOINT, { auth: { token } });
      sock.on('status', setResult);
      sock.on('result', setResult);
      setSocket(sock);

      return () => {
        sock.disconnect(); 
      };
    }
  }, [token]);

  const handlePrompt = () => {
    socket.emit('prompt', prompt);
    setResult('Generating...');
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'generated_code.txt';
    link.click();
  };

  const handleLogout = () => {
    if (socket) socket.disconnect();
    setSocket(null);
    setToken('');
  };

  if (!token) return <Login setToken={setToken} />;

  return (
    <div className="app-container">
      <div className="app-card">
        <div className="app-header">
          <h2>AI Code Generator</h2>
          <button className="btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="form-group">
          <label htmlFor="prompt">Enter Prompt</label>
          <textarea
            id="prompt"
            rows="5"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe the code you want to generate..."
          />
        </div>

        <div className="button-group">
          <button className="btn generate-btn" onClick={handlePrompt}>
            Generate
          </button>
          <button className="btn download-btn" onClick={handleDownload}>
            Download
          </button>
        </div>

        <div className="output-group">
          <label>Generated Code:</label>
          <pre>{result}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
