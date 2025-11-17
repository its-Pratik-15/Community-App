import { useState } from 'react'
import api from '../api/axios'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Container, Paper, TextField, Button, Typography, Link, CircularProgress, Box } from '@mui/material'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      const msg = 'Email and password are required'
      toast.error(msg)
      return setError(msg)
    }
    
    setLoading(true)
    
    try {
      const loginPromise = api.post('/auth/login', { email, password })
      
      toast.promise(
        loginPromise,
        {
          loading: 'Signing in...',
          success: (response) => {
            const { token } = response.data || {}
            if (token) {
              try {
                localStorage.setItem('token', token)
                localStorage.setItem('justLoggedIn', '1')
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                setTimeout(() => navigate('/'), 1000)
                return 'Login successful! Redirecting...'
              } catch (err) {
                console.error('Error saving to localStorage:', err)
                throw new Error('Failed to save session')
              }
            } else {
              throw new Error(response?.data?.error || 'Login failed')
            }
          },
          error: (err) => {
            return err.response?.data?.error || 'Login failed. Please try again.'
          }
        },
        {
          style: { minWidth: '250px' },
          success: { duration: 2000 },
          error: { duration: 4000 }
        }
      )
      
      await loginPromise
    } catch (e) {
      // Error is already handled by toast.promise
      console.error('Login error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Login
        </Typography>
        <form onSubmit={onSubmit}>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Box sx={{ position: 'relative', mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </form>
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          New here?{" "}
          <Link component={RouterLink} to="/register" color="secondary">
            Create an account
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}
