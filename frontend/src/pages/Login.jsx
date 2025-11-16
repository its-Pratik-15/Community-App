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
      // Use the axios instance from main.jsx
      const response = await axios.post('/api/auth/login', 
        { email, password }
      );
      
      const { data } = response;
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        // This will be handled by the interceptor, but we set it here too for immediate use
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      
      toast.success('Login successful!');
      // Use navigate for SPA navigation instead of full page reload
      navigate('/');
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
}
