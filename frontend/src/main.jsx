import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import axios from "axios";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Toaster } from "react-hot-toast";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// Configure axios to send cookies with every request
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Add request interceptor to include token in headers
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor to include the token in every request
axios.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      // Optionally redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster
        position="top-center"
        gutter={16}
        containerStyle={{
          top: '2rem',
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: '12px',
            padding: '16px 24px',
            boxShadow: theme.shadows[8],
            border: `1px solid ${theme.palette.divider}`,
            fontSize: '0.95rem',
            fontWeight: 500,
            maxWidth: '90%',
            width: 'fit-content',
            minWidth: '300px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'translateY(0)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[12],
            },
          },
          success: {
            iconTheme: {
              primary: theme.palette.success.main,
              secondary: theme.palette.success.contrastText,
            },
            style: {
              borderLeft: `4px solid ${theme.palette.success.main}`,
            },
          },
          error: {
            iconTheme: {
              primary: theme.palette.error.main,
              secondary: theme.palette.error.contrastText,
            },
            style: {
              borderLeft: `4px solid ${theme.palette.error.main}`,
            },
          },
          loading: {
            iconTheme: {
              primary: theme.palette.primary.main,
              secondary: theme.palette.primary.contrastText,
            },
            style: {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            },
          },
        }}
      />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
