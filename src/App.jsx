import { useState } from 'react';

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
        const data = await res.json();
        setError(data.message || 'Login failed');
        return;
      }
      const user = await res.json();
      onLoginSuccess(user);
    } catch {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '20px auto' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: '100%', padding: 8, marginBottom: 10 }}
      />
      <button type="submit" style={{ width: '100%', padding: 10, fontSize: 16 }}>
        Login
      </button>
    </form>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/financialdata');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      console.error('Error fetching transaction data:', err);
      setError('Failed to fetch transaction data');
      setData([]);
    }

    setLoading(false);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    fetchTransactionData();
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20, maxWidth: 900, margin: 'auto' }}>
      <h1>Welcome, {user.firstName} {user.lastName}</h1>

      <button
        onClick={fetchTransactionData}
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: 16, marginBottom: 20 }}
      >
        {loading ? 'Loading...' : 'Load Transactions'}
      </button>

      {error && <p style={{ color: 'red', marginTop: 20 }}>{error}</p>}

      {data.length > 0 ? (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: 'collapse', width: '100%' }}
        >
          <thead style={{ backgroundColor: '#f0f0f0' }}>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((val, i) => (
                  <td key={i}>{val !== null ? val.toString() : ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : !loading ? (
        <p>No transaction data loaded yet.</p>
      ) : null}
    </div>
  );
}