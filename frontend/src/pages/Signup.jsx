import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import api from "../api";
import { extractResponseData } from "../utils/apiResponseHandler";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("individual");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  
  const validateEmail = (email) => {
    if (!email) return "Email is required";

    const hasAtSymbol = email.includes('@');
    const parts = email.split('@');
    const hasDomain = parts.length === 2 && parts[1].includes('.');
    const hasValidChars = email.split('').every(char =>
      char.match(/[a-zA-Z0-9@._-]/) || char === '+'
    );

    if (!hasAtSymbol || !hasDomain || !hasValidChars) {
      return "Please enter a valid email address";
    }
    return "";
  };
  
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";

    if (!password.split('').some(char => char.match(/[A-Z]/))) {
      return "Password must contain at least one uppercase letter";
    }

    if (!password.split('').some(char => char.match(/[a-z]/))) {
      return "Password must contain at least one lowercase letter";
    }

    if (!password.split('').some(char => char.match(/[0-9]/))) {
      return "Password must contain at least one digit";
    }

    const specialChars = '!@#$%^&*(),.?":{}|<>';
    if (!password.split('').some(char => specialChars.includes(char))) {
      return "Password must contain at least one special character";
    }

    return "";
  };
  
  const handleFieldChange = (field, value, validator) => {
    const error = validator(value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    const newErrors = {
      email: emailError,
      password: passwordError
    };

    setErrors(newErrors);

    if (emailError || passwordError) {
      setMessage("Please fix the validation errors above");
      return;
    }

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    try {
      const response = await api.post("register/", {
        email: email,
        password: password,
        role: role
      });
      const responseData = extractResponseData(response);

      const { access, refresh } = responseData;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("role", role);

      await new Promise(resolve => setTimeout(resolve, 500));

      if (role === "individual") {
        navigate("/dashboard?openProfile=true");
      } else {
        navigate("/company?openProfile=true");
      }
    } catch (error) {
      if (error.response?.data) {
        const backendErrors = error.response.data;
        let errorMessage = "Registration failed: ";
        

        if (backendErrors.email) {
          errorMessage += backendErrors.email.join(", ") + ". ";
        }
        if (backendErrors.password) {
          errorMessage += backendErrors.password.join(", ") + ". ";
        }
        if (backendErrors.non_field_errors) {
          errorMessage += backendErrors.non_field_errors.join(", ");
        }

        setMessage(errorMessage);
      } else {
        setMessage("Registration failed. Please try again.");
      }
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
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddIcon />
        </Avatar>
        
        <Typography component="h1" variant="h4" gutterBottom>
          Create Account
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Join us today and start sharing securely
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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              handleFieldChange('email', e.target.value, validateEmail);
            }}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              handleFieldChange('password', e.target.value, validatePassword);
            }}
            error={!!errors.password}
            helperText={errors.password}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-select-label">Account Type</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Account Type"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="individual">Individual</MenuItem>
              <MenuItem value="company">Company</MenuItem>
            </Select>
          </FormControl>

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
            Create Account
          </Button>

          <Grid container justifyContent="center">
            <Grid item>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Sign in here
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}
