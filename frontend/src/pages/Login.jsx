import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Link as RouterLink } from 'react-router-dom'
import { Container, Paper, TextField, Button, Typography, Link } from '@mui/material'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Email and password are required')
    axios.post('/api/auth/login', { email, password })
      .then(r => {
        const { token } = r.data || {}
        if (token) {
          try { localStorage.setItem('token', token) } catch {}
          try { localStorage.setItem('justLoggedIn', '1') } catch {}
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          navigate('/')
        } else {
          const msg = r?.data?.error || 'Login failed. Please try again.'
          setError(msg)
        }
      })
      .catch((e) => {
        const msg = e?.response?.data?.error || 'Login failed. Please try again.'
        setError(msg)
      })
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>Login</Typography>
        <form onSubmit={onSubmit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">Login</Button>
        </form>
        {error ? <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography> : null}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          New here?{' '}
          <Link component={RouterLink} to="/register" color="secondary">
            Create an account
          </Link>
        </Typography>
      </Paper>
    </Container>
  )
}
