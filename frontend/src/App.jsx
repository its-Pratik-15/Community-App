import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingProvider } from './contexts/LoadingContext';
import Nav from './components/Nav';
import Login from './pages/Login';
import Register from './pages/Register';
import Notices from './pages/Notices';
import Issues from './pages/Issues';
import Staff from './pages/Staff';
import Maintenance from './pages/Maintenance';
import RequireAuth from './components/RequireAuth';
import Box from '@mui/material/Box';
import Profile from './pages/Profile';
import LoadingProgress from './components/LoadingProgress';

export default function App() {
  return (
    <LoadingProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Nav />
        <LoadingProgress />
        <Box component="main" sx={{ p: 2, maxWidth: '96rem', mx: 'auto' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<RequireAuth><Notices /></RequireAuth>} />
            <Route path="/notices" element={<RequireAuth><Notices /></RequireAuth>} />
            <Route path="/issues" element={<RequireAuth><Issues /></RequireAuth>} />
            <Route path="/staff" element={<RequireAuth><Staff /></RequireAuth>} />
            <Route path="/maintenance" element={<RequireAuth><Maintenance /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/notices" replace />} />
          </Routes>
        </Box>
      </Box>
    </LoadingProvider>
  );
}
