import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Container, Paper, Typography, Box, Chip, CircularProgress } from '@mui/material'

export default function Maintenance() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/maintenance');
        setItems(response.data);
      } catch (error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [])
  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>Maintenance</Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
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
      )}
    </Container>
  )
}
