"use client"

import { useState } from 'react'
import axios from 'axios'

export default function DebugLogin() {
  const [email, setEmail] = useState('john.kamau@monteza.com')
  const [password, setPassword] = useState('password123')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      setResult(response.data)
      console.log('Login successful:', response.data)
    } catch (err: any) {
      setError(err.message)
      if (err.response) {
        console.error('Response error:', err.response.data)
        setResult(err.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Debug Login Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <input 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={testLogin} disabled={loading}>
          {loading ? 'Testing...' : 'Test Login'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <h3>Error: {error}</h3>
        </div>
      )}

      {result && (
        <div>
          <h3>Result:</h3>
          <pre style={{ background: '#f0f0f0', padding: '10px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '12px' }}>
        <h4>Environment Info:</h4>
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        <p>Backend: http://localhost:3001</p>
        <p>Test with: john.kamau@monteza.com / password123</p>
      </div>
    </div>
  )
}
