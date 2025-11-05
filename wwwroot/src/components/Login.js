import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.message || 'Login failed');
        return;
      }
      const user = await res.json();
      onLoginSuccess(user);
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <br />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;