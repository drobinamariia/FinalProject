
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Paper,
  Avatar,
  Grid
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");


    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");

    try {
      const tokenResponse = await api.post("token/", { email: email, password: password });

      let access, refresh;
      if (tokenResponse.data.success) {
        access = tokenResponse.data.data.access;
        refresh = tokenResponse.data.data.refresh;
      } else {
        access = tokenResponse.data.access;
        refresh = tokenResponse.data.refresh;
      }

      if (!access || !refresh) {
        throw new Error("Invalid token response");
      }

      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      await new Promise(resolve => setTimeout(resolve, 100));

      let role = null;
      try {
        const profileResponse = await api.get("profile/");

        let profileData;
        if (profileResponse.data.success) {
          profileData = profileResponse.data.data;
        } else {
          profileData = profileResponse.data;
        }

        role = profileData.role || "individual";
        localStorage.setItem("role", role);
      } catch (profileErr) {
        console.error("Profile fetch error:", profileErr);

        if (profileErr.response?.status === 401) {
          throw new Error("Authentication failed - invalid token");
        }

        role = "individual";
        localStorage.setItem("role", role);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.response?.data?.message || err.userMessage || "Login failed");
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 400,
          width: '100%',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        
        <Typography component="h1" variant="h4" gutterBottom>
          Welcome Back
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to your account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {message && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Sign In
          </Button>

          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/signup" variant="body2">
                  Sign up here
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
