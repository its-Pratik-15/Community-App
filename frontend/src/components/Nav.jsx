import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'

export default function Nav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    const t = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    setHasToken(Boolean(t))
    if (!t) { setMe(null); return }
    axios.get('/api/me').then(r => setMe(r.data)).catch(() => setMe(null))
  }, [pathname])

  const logout = () => {
    try { localStorage.removeItem('token') } catch {}
    window.location.href = '/login'
  }

  const initials = (n) => {
    const base = (n || me?.email || '?').trim()
    const parts = base.split(' ')
    return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U'
  }

  const NavLink = ({ to, label }) => (
    <Button
      onClick={() => navigate(to)}
      sx={{
        textTransform: 'none',
        color: pathname === to ? 'primary.main' : 'text.primary',
        fontWeight: pathname === to ? 600 : 400
      }}
    >{label}</Button>
  )

  return (
    <AppBar position="sticky" color="primary" enableColorOnDark elevation={2}>
      <Toolbar sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Community</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <NavLink to="/notices" label="Notices" />
          <NavLink to="/issues" label="Issues" />
          {(me?.role === 'SECRETARY' || me?.role === 'STAFF') && (
            <NavLink to="/staff" label="Staff" />
          )}
          {me?.role !== 'STAFF' && (
            <NavLink to="/maintenance" label="Maintenance" />
          )}
        </Box>
        <Tooltip title="Toggle theme">
          <IconButton
            onClick={() => {
              const cur = window.__getAppColorMode?.()
              window.__setAppColorMode?.(cur === 'dark' ? 'light' : 'dark')
            }}
            sx={{ ml: 1 }}
          >
            {typeof window !== 'undefined' && window.__getAppColorMode?.() === 'dark' ? (
              <LightModeIcon fontSize="small" />
            ) : (
              <DarkModeIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
        {me || hasToken ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Tooltip title={me ? (me.name || me.email) : 'Profile'}>
              <IconButton onClick={() => navigate('/profile')} size="small">
                {me?.photo ? (
                  <Avatar src={me.photo} alt="profile" />
                ) : (
                  <Avatar>{initials(me?.name)}</Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Button variant="outlined" color="inherit" onClick={logout}>Logout</Button>
          </Box>
        ) : (
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ ml: 2 }}>Login</Button>
        )}
      </Toolbar>
    </AppBar>
  )
}
