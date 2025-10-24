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
} from "@mui/material";

export default function Notices() {
  const [items, setItems] = useState([]);
  const [me, setMe] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    axios
      .get("/api/notices")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]));
    axios
      .get("/api/me")
      .then((r) => setMe(r.data))
      .catch(() => setMe(null));
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
            sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {n.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {n.content}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Container>
  );
}
