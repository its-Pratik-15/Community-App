import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import axios from 'axios'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'


// Axios base URL from env (Vercel uses VITE_ vars)
function setAxiosBaseURL() {
  const v = import.meta?.env?.VITE_API_BASE_URL
  if (!v) return
  axios.defaults.baseURL = v
}
setAxiosBaseURL()

const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function Root() {
  const getInitialMode = () => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('colorMode') : null
    if (saved === 'light' || saved === 'dark') return saved
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }
  const [mode, setMode] = React.useState(getInitialMode)

  React.useEffect(() => {
    try { localStorage.setItem('colorMode', mode) } catch {}
  }, [mode])

  // Expose global toggle so Nav.jsx can call it without prop drilling
  React.useEffect(() => {
    window.__setAppColorMode = (m) => setMode(m)
    window.__getAppColorMode = () => mode
    return () => { delete window.__setAppColorMode; delete window.__getAppColorMode }
  }, [mode])

  const theme = React.useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#2563eb' }, // blue-600
      secondary: { main: '#7c3aed' }, // violet-600
      ...(mode === 'light'
        ? { background: { default: '#f5f7fb', paper: '#ffffff' } }
        : {
            background: { default: '#0a0c10', paper: '#0f172a' }, // darker dark mode
            text: { primary: '#e5e7eb', secondary: '#9ca3af' }
          }
      ),
    },
    typography: {
      fontFamily: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif',
    },
    shape: { borderRadius: 10 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            transition: 'all .2s ease',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }
          },
          outlined: {
            '&:hover': { background: 'rgba(99,102,241,0.08)' }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: { transition: 'background-color .2s ease, border-color .2s ease' }
        }
      }
    }
  }), [mode])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
