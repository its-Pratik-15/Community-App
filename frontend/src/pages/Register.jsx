import { useState } from 'react'
import api from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Paper, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('TENANT')
  const [password, setPassword] = useState('')
  const [block, setBlock] = useState('')
  const [flatNo, setFlatNo] = useState('')
  const [workerType, setWorkerType] = useState('Cleaning')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Email and password are required')
    if ((role === 'TENANT' || role === 'OWNER') && (!block || !flatNo)) return setError('Block and Flat No. are required for residents')
    if (role === 'WORKER' && !workerType) return setError('Please select a worker type')
    try {
      const payload = { email, name, role, password }
      if (role === 'WORKER') {
        payload.workerType = workerType
      } else {
        payload.block = block
        payload.flatNo = flatNo
      }
      const response = await api.post('/auth/register', payload)
      const { token } = response.data || {}
      if (token) {
        try { localStorage.setItem('token', token) } catch {}
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        navigate('/')
      } else {
        setError('Registration failed. Please try again.')
      }
    } catch (e) {
      const msg = e?.response?.data?.error || 'Registration failed. Please try again.'
      setError(msg)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>Create your account</Typography>
        <Box component="form" onSubmit={onSubmit}>
          <TextField fullWidth label="Full name" margin="normal" value={name} onChange={e => setName(e.target.value)} />
          <TextField fullWidth label="Email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select labelId="role-label" label="Role" value={role} onChange={e => setRole(e.target.value)}>
              <MenuItem value="TENANT">Tenant</MenuItem>
              <MenuItem value="OWNER">Owner</MenuItem>
              <MenuItem value="WORKER">Worker</MenuItem>
            </Select>
          </FormControl>
          {(role === 'TENANT' || role === 'OWNER') && (
            <>
              <TextField fullWidth label="Block" margin="normal" value={block} onChange={e => setBlock(e.target.value)} />
              <TextField fullWidth label="Flat No." margin="normal" value={flatNo} onChange={e => setFlatNo(e.target.value)} />
            </>
          )}
          {role === 'WORKER' && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="worker-type-label">Worker Type</InputLabel>
              <Select labelId="worker-type-label" label="Worker Type" value={workerType} onChange={e => setWorkerType(e.target.value)}>
                <MenuItem value="Cleaning">Cleaning</MenuItem>
                <MenuItem value="Security">Security</MenuItem>
                <MenuItem value="Electrician">Electrician</MenuItem>
                <MenuItem value="Plumber">Plumber</MenuItem>
                <MenuItem value="Gardener">Gardener</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          )}
          <TextField fullWidth type="password" label="Password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
          <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">Create account</Button>
        </Box>
        {error ? <Typography color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography> : null}
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </Typography>
      </Paper>
    </Container>
  )
}
