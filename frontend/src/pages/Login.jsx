import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { Container, Paper, Typography, Box, TextField, Button, Link, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    showLoading();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important for cookies
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Store user data and token in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store token if provided in response
      if (data.token) {
        localStorage.setItem('token', data.token);
        // Set default authorization header for axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      
      toast.success('Login successful');
      window.location.href = '/'; // Full page reload to ensure auth state is properly set
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      hideLoading();
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
          <Box sx={{ position: "relative" }}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                height: "48px",
                "&.Mui-disabled": {
                  backgroundColor: "primary.main",
                  opacity: 0.7,
                  color: "white",
                },
              }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Login"}
              {isLoading && (
                <CircularProgress
                  size={24}
                  sx={{
                    color: "white",
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    marginTop: "-12px",
                    marginLeft: "-12px",
                  }}
                />
              )}
            </Button>
          </Box>
        </form>
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
