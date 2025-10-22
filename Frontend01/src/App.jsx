import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [backendData, setBackendData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Replace /api/your-endpoint with your actual backend API route
    fetch('http://localhost:5000')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        setBackendData(data)
        setError(null)
      })
      .catch((err) => {
        console.error('Error fetching from backend:', err)
        setError('Failed to fetch backend data')
        setBackendData(null)
      })
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
      </div>

      <div className="backend-data">
        <h2>Backend Data:</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!error && !backendData && <p>Loading...</p>}
        {!error && backendData && (
          <pre>{JSON.stringify(backendData, null, 2)}</pre>
        )}
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App