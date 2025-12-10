import React, { useEffect, useState } from 'react';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/transaction')
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching transactions:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div>
      <h2>Transaction Data</h2>
      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>TransactionId</th>
            <th>AccountId</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Description</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr><td colSpan="6">No transactions found.</td></tr>
          ) : (
            transactions.map(tx => (
              <tr key={tx.TransactionId}>
                <td>{tx.TransactionId}</td>
                <td>{tx.AccountId}</td>
                <td>{tx.Amount}</td>
                <td>{tx.Type}</td>
                <td>{tx.Description}</td>
                <td>{new Date(tx.CreatedAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Transactions;