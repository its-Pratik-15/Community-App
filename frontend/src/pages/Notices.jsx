import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Divider,
  Stack,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { formatDistanceToNow } from 'date-fns';
import { useLoading } from '../contexts/LoadingContext';

export default function Notices() {
  const [items, setItems] = useState([]);
  const [me, setMe] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showLoading, hideLoading } = useLoading();
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        showLoading();
        
        const [noticesResponse, meResponse] = await Promise.all([
          axios.get("/api/notices", { withCredentials: true }),
          axios.get("/api/me", { withCredentials: true })
        ]);
        
        if (isMounted) {
          setItems(noticesResponse.data);
          setMe(meResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setItems([]);
          setMe(null);
          setError('Failed to load notices');
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      setDeletingId(id);
      try {
        showLoading();
        await axios.delete(`/api/notices/${id}`, { withCredentials: true });
        setItems(items.filter((item) => item.id !== id));
        toast.success('Notice deleted successfully');
      } catch (err) {
        console.error('Error deleting notice:', err);
        toast.error(err.response?.data?.error || 'Failed to delete notice');
      } finally {
        setDeletingId(null);
        hideLoading();
      }
    } catch (err) {
      console.error('Error deleting notice:', err);
      toast.error(err.response?.data?.error || 'Failed to delete notice');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      showLoading();
      
      const response = await axios.post(
        "/api/notices",
        { title, content },
        { withCredentials: true }
      );
      
      setItems([response.data, ...items]);
      setTitle("");
      setContent("");
      toast.success('Notice created successfully');
    } catch (err) {
      console.error('Error creating notice:', err);
      setError(err.response?.data?.error || 'Failed to create notice');
    } finally {
      setSaving(false);
      hideLoading();
    }
  };

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Notices
      </Typography>

      {me?.role === "SECRETARY" && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Create notice
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Title"
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              fullWidth
              label="Content"
              margin="normal"
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={saving}
            >
              {saving ? "Posting…" : "Post notice"}
            </Button>
          </Box>
        </Paper>
      )}

      <Stack spacing={2} sx={{ mt: 4 }}>
        {safeItems.length === 0 ? (
          <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mt: 2 }}>
            {error ? 'Error loading notices' : 'No notices found'}
          </Typography>
        ) : (
          safeItems.map((item) => (
          <Card key={item.id} variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6" component="h2">{item.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </Typography>
                </Box>
                {(me?.role === 'ADMIN' || me?.role === 'SECRETARY') && (
                  <IconButton 
                    aria-label="delete notice" 
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {item?.content}
              </Typography>
            </CardContent>
          </Card>
          )))
        }
      </Stack>
    </Container>
  );
}
