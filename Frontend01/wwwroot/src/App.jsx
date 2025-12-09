import React, { useState, useEffect } from 'react';

// Replace with your backend URL (HTTP or HTTPS)
const BACKEND_URL = "https://brentaneal-alb-1159597609.us-east-1.elb.amazonaws.com";

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [txError, setTxError] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  // Store JWT token internally; using ref to avoid unwanted rerenders
  const [token, setToken] = useState('');

  // Handles user login
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Login failed');
      }

      const data = await res.json();

      if (!data.token || !data.user) {
        throw new Error('Invalid login response');
      }

      setToken(data.token);
      setUser(data.user);

      setEmail('');
      setPassword('');
      fetchTransactions(data.token, '');
    } catch (err) {
      setError(err.message || 'Network or server error');
    } finally {
      setLoading(false);
    }
  }

  // Fetch transactions for logged in user
  async function fetchTransactions(tok, search) {
    setTxLoading(true);
    setTxError('');
    try {
      let url = `${BACKEND_URL}/api/transactions`;
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${tok}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to load transactions');
      }
      const txs = await res.json();
      setTransactions(Array.isArray(txs) ? txs : []);
    } catch (err) {
      setTxError(err.message || 'Error fetching transactions');
    } finally {
      setTxLoading(false);
    }
  }

  // On search change, update transactions
  function onSearchChange(e) {
    const val = e.target.value;
    setSearchTerm(val);
    if (token) {
      fetchTransactions(token, val);
    }
  }

  // Logout handler
  function logout() {
    setUser(null);
    setToken('');
    setTransactions([]);
    setSearchTerm('');
    setError('');
    setTxError('');
    setEmail('');
    setPassword('');
  }

  if (!user) {
    // Login screen
    return (
      <div style={{ maxWidth: 400, margin: '50px auto', fontFamily: 'Arial, sans-serif' }}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: 10, marginBottom: 10, fontSize: 16 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{ width: '100%', padding: 10, marginBottom: 20, fontSize: 16 }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              fontSize: 18,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  // After login - show welcome and transactions list with search
  const filteredTransactions = transactions.filter(tx =>
    tx.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: 900, margin: '50px auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Welcome, {user.firstName} {user.lastName}</h2>
      <p>Email: {user.email}</p>
      <button
        onClick={logout}
        style={{ padding: 10, fontSize: 16, marginBottom: 20, cursor: 'pointer' }}
      >
        Logout
      </button>

      <h3>Transactions</h3>

      <input
        type="text"
        placeholder="Search transactions..."
        value={searchTerm}
        onChange={onSearchChange}
        style={{
          width: '100%',
          fontSize: 16,
          padding: 8,
          marginBottom: 15,
          borderRadius: 4,
          border: '1px solid #ccc',
        }}
      />

      {txError && <p style={{ color: 'red' }}>{txError}</p>}
      {txLoading && <p>Loading transactions...</p>}
      {!txLoading && filteredTransactions.length === 0 && <p>No transactions found.</p>}

      <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#eee' }}>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(tx => (
            <tr key={tx.transactionId}>
              <td>{tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}</td>
              <td>{tx.description || '-'}</td>
              <td>{tx.type || '-'}</td>
              <td style={{ textAlign: 'right' }}>
                {typeof tx.amount === 'number' ? tx.amount.toFixed(2) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;