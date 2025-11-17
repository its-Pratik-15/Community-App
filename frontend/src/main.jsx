import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Toaster from './components/Toaster';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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
