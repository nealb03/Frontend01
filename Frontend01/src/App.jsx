import React, { useState, useEffect, useCallback } from "react";

// Vite injects __API_BASE_URL__ at build time (see vite.config.js)
const API_BASE = typeof __API_BASE_URL__ !== "undefined" ? __API_BASE_URL__ : "";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // -------------------------------------------------
  // Helpers
  // -------------------------------------------------
  const fetchJSON = useCallback(async (url, options = {}) => {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || res.statusText);
    return data;
  }, []);

  // -------------------------------------------------
  // Auth
  // -------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const url = `${API_BASE}/api/auth/login`;
      console.log("POST", url);
      const data = await fetchJSON(url, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTransactions([]);
    setError("");
  };

  // -------------------------------------------------
  // Transactions
  // -------------------------------------------------
  const fetchTransactions = useCallback(
    async (term) => {
      if (!user) return;
      setLoading(true);
      setError("");
      try {
        let url = `${API_BASE}/api/transactions`;
        if (term) url += `?search=${encodeURIComponent(term)}`;
        console.log("GET", url);
        const data = await fetchJSON(url);
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch transactions error:", err);
        setError(err.message || "Failed to load transactions");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [user, fetchJSON]
  );

  useEffect(() => {
    if (user) fetchTransactions(search);
  }, [user, search, fetchTransactions]);

  // -------------------------------------------------
  // Render (Login Screen)
  // -------------------------------------------------
  if (!user) {
    return (
      <div style={styles.center}>
        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={styles.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    );
  }

  // -------------------------------------------------
  // Render (User Dashboard)
  // -------------------------------------------------
  return (
    <div style={{ padding: 20 }}>
      <header style={styles.header}>
        <h2>
          Welcome, {user.firstName} {user.lastName}
        </h2>
        <button onClick={handleLogout} style={styles.logout}>
          Logout
        </button>
      </header>

      <input
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
      />

      {error && <div style={styles.error}>{error}</div>}
      {loading && <p>Loading...</p>}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Account Type</th>
            <th style={styles.th}>Account Number</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} style={styles.empty}>
                No transactions found.
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.transactionId} style={styles.row}>
                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                <td>{t.type}</td>
                <td>{t.description}</td>
                <td>{Number(t.amount).toFixed(2)}</td>
                <td>{t.account?.accountType}</td>
                <td>{t.account?.accountNumber}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// -------------------------------------------------
// Inline styles
// -------------------------------------------------
const styles = {
  center: {
    display: "flex",
    minHeight: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  form: {
    width: 320,
    padding: 30,
    borderRadius: 6,
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  error: { marginBottom: 15, color: "red" },
  input: {
    width: "100%",
    height: 40,
    marginBottom: 15,
    fontSize: 16,
    padding: "0 10px",
    borderRadius: 4,
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    height: 42,
    fontSize: 17,
    backgroundColor: "#1890ff",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  logout: {
    backgroundColor: "#ff5858",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "8px 14px",
    cursor: "pointer",
  },
  search: {
    padding: 8,
    width: "100%",
    maxWidth: 400,
    marginBottom: 20,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 5px", backgroundColor: "#f7f7f7" },
  row: { borderBottom: "1px solid #eee" },
  empty: { textAlign: "center", padding: 20 },
};