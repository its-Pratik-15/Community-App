import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import toast from 'react-hot-toast';

export default function Notices() {
  const [items, setItems] = useState([]);
  const [me, setMe] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [noticesResponse, meResponse] = await Promise.all([
          axios.get("/api/notices"),
          axios.get("/api/me")
        ]);
        setItems(noticesResponse.data);
        setMe(meResponse.data);
      } catch (error) {
        setItems([]);
        setMe(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }
    try {
      setSaving(true);
      const r = await axios.post("/api/notices", { title, content });
      setItems((prev) => [r.data, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      const msg = err?.response?.data?.error || "Failed to post notice";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (notice) => {
    setNoticeToDelete(notice);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!noticeToDelete) return;
    
    try {
      await axios.delete(`/api/notices/${noticeToDelete.id}`);
      setItems(prev => prev.filter(item => item.id !== noticeToDelete.id));
      toast.success('Notice deleted successfully');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to delete notice';
      toast.error(msg);
    } finally {
      setDeleteDialogOpen(false);
      setNoticeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setNoticeToDelete(null);
  };

  // Only SECRETARY can delete notices
  const canDeleteNotice = () => {
    return me?.role === 'SECRETARY';
  };

  return (
    <Container maxWidth="md" sx={{ mt: 3 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Notices
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {me?.role === "SECRETARY" && (
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Create notice
              </Typography>
              <Box component="form" onSubmit={submit}>
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
          <Box sx={{ display: "grid", gap: 1 }}>
            {items.map((n) => (
              <Paper
                key={n.id}
                elevation={0}
                sx={{ 
                  p: 2, 
                  border: "1px solid", 
                  borderColor: "divider",
                  position: 'relative',
                  '&:hover .delete-button': {
                    opacity: 1,
                  }
                }}
              >
                {canDeleteNotice(n) && (
                  <IconButton
                    className="delete-button"
                    onClick={() => handleDeleteClick(n)}
                    size="small"
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.04)',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
                <Typography variant="subtitle1" fontWeight={600}>
                  {n.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {n.content}
                </Typography>
              </Paper>
            ))}
          </Box>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Notice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this notice? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
