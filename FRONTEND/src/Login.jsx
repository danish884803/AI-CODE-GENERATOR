import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://ai-code-generator-backend.vercel.app/api/auth/login', form);
      setToken(res.data.token); 
    } catch {
      alert('Login failed');
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('https://ai-code-generator-backend.vercel.app/api/auth/register', form);
      const res = await axios.post('https://ai-code-generator-backend.vercel.app/api/auth/login', form);
      setToken(res.data.token); 
    } catch {
      alert('Registration failed');
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <h3 className="text-center mb-4 text-primary">Login or Register</h3>

        <div className="mb-3">
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="d-grid gap-2">
          <button onClick={handleLogin} className="btn btn-primary">
            Login
          </button>
          <button onClick={handleRegister} className="btn btn-secondary">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
