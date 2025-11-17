import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import axios from 'axios'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Toaster from './components/Toaster'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

// Configure axios defaults - using relative paths since we're proxying through Vercel
const API_BASE_URL = ''; // Empty for relative paths

// Set axios base URL based on environment
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
axios.defaults.baseURL = baseURL;

// Log environment for debugging (remove in production)
console.log('API Base URL:', baseURL);

// Add request interceptor to include token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip for login/register requests to prevent infinite loops
    if (config.url.includes('/auth/')) {
      return config;
    }
    
    // Try to get token from localStorage first
    let token = localStorage.getItem('token');
    
    // If no token in localStorage, try to get it from cookies
    if (!token && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').reduce((cookies, cookie) => {
        const [name, value] = cookie.trim().split('=');
        return { ...cookies, [name]: value };
      }, {});
      
      if (cookies.token) {
        token = cookies.token;
        // Store it in localStorage for future use
        localStorage.setItem('token', token);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ensure credentials are sent with every request
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    // If we get a new token in the response, update it
    if (response.data?.token) {
      console.log('New token received, updating...');
      localStorage.setItem('token', response.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response;
  },
  (error) => {
    console.log('Interceptor error:', {
      status: error.response?.status,
      path: window.location.pathname,
      isLoginPage: window.location.pathname === '/login'
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Clearing auth data and redirecting...');
      
      // Clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        const returnUrl = `?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        console.log('Redirecting to login with return URL:', returnUrl);
        window.location.href = `/login${returnUrl}`;
      }
      
      // Return a resolved promise to prevent the error from propagating
      return Promise.resolve();
    }
    
    // For other errors, reject with the error
    return Promise.reject(error);
  }
);

// Set axios instance as default
export default axiosInstance;

function Root() {
  const getInitialMode = () => {
    const saved =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("colorMode")
        : null;
    if (saved === "light" || saved === "dark") return saved;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };
  const [mode, setMode] = React.useState(getInitialMode);

  React.useEffect(() => {
    try {
      localStorage.setItem("colorMode", mode);
    } catch {}
  }, [mode]);

  React.useEffect(() => {
    window.__setAppColorMode = (m) => setMode(m);
    window.__getAppColorMode = () => mode;
    return () => {
      delete window.__setAppColorMode;
      delete window.__getAppColorMode;
    };
  }, [mode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#2563eb" },
          secondary: { main: "#7c3aed" },
          ...(mode === "light"
            ? { background: { default: "#f5f7fb", paper: "#ffffff" } }
            : {
                background: { default: "#0a0c10", paper: "#0f172a" },
                text: { primary: "#e5e7eb", secondary: "#9ca3af" },
              }),
        },
        typography: {
          fontFamily:
            'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif',
        },
        shape: { borderRadius: 10 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                transition: "all .2s ease",
              },
              contained: {
                boxShadow: "none",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                },
              },
              outlined: {
                "&:hover": { background: "rgba(99,102,241,0.08)" },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: "background-color .2s ease, border-color .2s ease",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
