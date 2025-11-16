import { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Paper, Typography, Box, Button, Chip, Alert, CircularProgress } from '@mui/material'
import { useLoading } from '../contexts/LoadingContext'

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        showLoading();
        
        const [staffResponse, profileResponse] = await Promise.all([
          axios.get('/api/staff'),
          axios.get('/api/profile/me')
        ]);

        if (isMounted) {
          setStaff(staffResponse.data);
          setMe(profileResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setStaff([]);
          setMe(null);
          setError('Failed to load staff data');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const toggleDuty = async (member) => {
    setError('');
    try {
      showLoading();
      const r = await axios.patch(`/api/staff/${member.id}`, { isOnDuty: !member.isOnDuty });
      setStaff(prev => prev.map(s => s.id === member.id ? r.data : s));
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to update duty status';
      setError(msg);
    } finally {
      hideLoading();
    }
  }
  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>Staff</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gap: 1 }}>
        {staff.map(s => (
          <Paper key={s.id} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{s.name}</Typography>
              <Typography variant="body2" color="text.secondary">{s.role}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={s.isOnDuty ? 'On duty' : 'Off duty'} color={s.isOnDuty ? 'success' : 'default'} size="small" />
              {me?.role === 'SECRETARY' && (
                <Button variant="outlined" size="small" onClick={() => toggleDuty(s)}>
                  {s.isOnDuty ? 'Mark off duty' : 'Mark on duty'}
                </Button>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Container>
  )
}
