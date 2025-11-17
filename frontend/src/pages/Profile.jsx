import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Container, Paper, Typography, TextField, Button, Alert, Box, Chip } from '@mui/material'

export default function Profile() {
  const [data, setData] = useState(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    api.get('/profile/me')
      .then(r => { 
        if (r.data) {
          setData(r.data); 
          setName(r.data.name || '');
          setMsg('');
        } else {
          setErr('Failed to load profile');
        }
      })
      .catch(() => setErr('Failed to load profile'));
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      if (!String(name).trim()) {
        setErr('Name must not be empty');
        setMsg('');
        return;
      }
      const r = await axios.patch('/api/profile', { name }, { withCredentials: true });
      if (r.data) {
        setData(r.data);
        setMsg('Saved');
        setErr('');
      } else {
        throw new Error('Save failed');
      }
    } catch (e) {
      const msg = e?.response?.data?.error || 'Save failed';
      setErr(msg);
      setMsg('');
    } finally {
      setSaving(false);
    }
  }

  if (!data) return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography>Loading…</Typography>
      </Paper>
    </Container>
  )

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>Profile</Typography>
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body1" color="text.primary">{data.email}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Role</Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip label={data.role} size="small" />
            </Box>
          </Box>
          <Box>
            <TextField fullWidth label="Name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            {msg && <Typography variant="body2" color="success.main">{msg}</Typography>}
            {err && <Typography variant="body2" color="error.main">{err}</Typography>}
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}
