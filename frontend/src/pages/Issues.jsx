import { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Paper, Typography, Box, TextField, Button, Chip, Alert, CircularProgress } from '@mui/material'
import { useLoading } from '../contexts/LoadingContext'

export default function Issues() {
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { showLoading, hideLoading } = useLoading()
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        showLoading();
        
        const [issuesResponse, profileResponse] = await Promise.all([
          axios.get('/api/issues'),
          axios.get('/api/profile/me')
        ]);
        
        if (isMounted) {
          setItems(issuesResponse.data);
          setMe(profileResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) {
          setItems([]);
          setMe(null);
          setError('Failed to load data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        hideLoading();
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
      hideLoading();
    };
  }, [showLoading, hideLoading]);
  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await axios.post('/api/issues', { description: text })
    setText('')
    const r = await axios.get('/api/issues')
    setItems(r.data)
  }
  const deleteIssue = async (issue) => {
    setError('')
    try {
      await axios.delete(`/api/issues/${issue.id}`)
      setItems(prev => prev.filter(i => i.id !== issue.id))
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to delete issue'
      setError(msg)
    }
  }
  const takeIssue = async (issue) => {
    setError('')
    try {
      const r = await axios.post(`/api/issues/${issue.id}/take`)
      setItems(prev => prev.map(i => i.id === issue.id ? r.data : i))
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to take issue'
      setError(msg)
    }
  }
  const resolveIssue = async (issue) => {
    setError('')
    try {
      const r = await axios.post(`/api/issues/${issue.id}/resolve`)
      setItems(prev => prev.map(i => i.id === issue.id ? r.data : i))
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to resolve issue'
      setError(msg)
    }
  }
  const reopenIssue = async (issue) => {
    setError('')
    try {
      const r = await axios.patch(`/api/issues/${issue.id}`, { status: 'OPEN' })
      setItems(prev => prev.map(i => i.id === issue.id ? r.data : i))
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to reopen issue'
      setError(msg)
    }
  }
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    )
  }

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>Issues</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={submit} sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField fullWidth size="small" value={text} onChange={e=>setText(e.target.value)} placeholder="Describe an issue" />
        <Button type="submit" variant="contained">Submit</Button>
      </Box>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {safeItems.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
            {error ? 'Error loading issues' : 'No issues found'}
          </Typography>
        ) : (
          safeItems.map(i => {
          const canTakeStaff = me?.role === 'STAFF' && i.status === 'OPEN'
          const isSecretary = me?.role === 'SECRETARY'
          const canResolve = isSecretary || (me?.role === 'STAFF' && i.status === 'IN_PROGRESS' && i.assignedStaffId)
          return (
            <Paper key={i.id} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>{i.description}</Typography>
                <Chip label={i.status} size="small" color={i.status === 'RESOLVED' ? 'success' : (i.status === 'IN_PROGRESS' ? 'warning' : 'default')} sx={{ mt: 0.5 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {canTakeStaff && (
                  <Button size="small" variant="outlined" onClick={() => takeIssue(i)}>Take</Button>
                )}
                {me?.role === 'STAFF' && i.status === 'IN_PROGRESS' && i.assignedStaffId ? (
                  <Button size="small" variant="contained" onClick={() => resolveIssue(i)}>Resolve</Button>
                ) : null}
                {isSecretary && i.status === 'RESOLVED' && (
                  <Button size="small" variant="outlined" onClick={() => reopenIssue(i)}>Mark Unresolved</Button>
                )}
                {isSecretary && (
                  <Button size="small" color="secondary" variant="outlined" onClick={() => deleteIssue(i)}>Delete</Button>
                )}
              </Box>
            </Paper>
          )})
        )}
      </Box>
    </Container>
  )
}
