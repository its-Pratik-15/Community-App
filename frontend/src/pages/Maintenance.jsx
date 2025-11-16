import { useEffect, useState } from 'react'
import axios from 'axios'
import { Container, Paper, Typography, Box, Chip, CircularProgress } from '@mui/material'
import { useLoading } from '../contexts/LoadingContext'

export default function Maintenance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        showLoading();
        
        const response = await axios.get('/api/maintenance');
        
        if (isMounted) {
          setItems(response.data);
        }
      } catch (err) {
        console.error('Error fetching maintenance data:', err);
        if (isMounted) {
          setItems([]);
          setError('Failed to load maintenance data');
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
  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>Maintenance</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'grid', gap: 1 }}>
        {items.map((m) => {
          const displayName = m.user?.name || m.user?.email || `User #${m.userId}`
          return (
            <Paper key={m.id} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary">{displayName}</Typography>
                <Typography variant="body2" color="text.secondary">Amount: {m.amount}</Typography>
              </Box>
              <Chip label={m.status} color={m.status === 'PAID' ? 'success' : 'warning'} size="small" />
            </Paper>
          )
        })}
      </Box>
    </Container>
  )
}
