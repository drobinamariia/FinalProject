import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from 'yup';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { getNames } from 'country-list';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Grid,
  AppBar,
  Toolbar,
  Paper,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  Save as SaveIcon,
  AccountCircle as AccountIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Badge as BadgeIcon,
  Public as CountryIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../api";

const steps = ["Basic Info", "Contact Details", "About You"];

export default function PersonalDetails() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: null,
    phone: "",
    address: "",
    country: "",
    bio: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [errors, setErrors] = useState({});


  const validCountryNames = getNames();
  

  const validateName = (name) => {
    if (!name) return false;

    const nameChars = name.split('');
    return nameChars.every(char => {
      return char.match(/[a-zA-Z]/) || char === ' ' || char === '-' || char === "'";
    });
  };
  
  const validateCountryName = (country) => {
    if (!country) return true;
    const normalizedInput = country.toLowerCase().trim();
    

    return validCountryNames.some(validName => {
      const normalizedValid = validName.toLowerCase();
      return normalizedValid.includes(normalizedInput) || normalizedInput.includes(normalizedValid);
    });
  };
  

  const validationSchema = yup.object({
    first_name: yup
      .string()
      .trim()
      .required('First name is required')
      .min(1, 'First name cannot be empty')
      .max(50, 'First name must be 50 characters or less')
      .test('name-format', 'Name can only contain letters, spaces, hyphens, and apostrophes', validateName),
    
    last_name: yup
      .string()
      .trim()
      .required('Last name is required')
      .min(1, 'Last name cannot be empty')
      .max(50, 'Last name must be 50 characters or less')
      .test('name-format', 'Name can only contain letters, spaces, hyphens, and apostrophes', validateName),
    
    phone: yup
      .string()
      .test('phone-format', 'Please enter a valid phone number', function(value) {
        if (!value || value.trim() === '') return true;
        try {
          return isValidPhoneNumber(value.trim());
        } catch (error) {
          return false;
        }
      }),
    
    country: yup
      .string()
      .max(100, 'Country name must be 100 characters or less')
      .test('country-format', 'Please enter a valid country name', validateCountryName),
    
    address: yup
      .string()
      .max(500, 'Address must be 500 characters or less'),
    
    bio: yup
      .string()
      .max(500, 'Bio must be 500 characters or less')
  });
  

  const validateField = async (field, value) => {
    try {
      await validationSchema.validateAt(field, { [field]: value });
      return '';
    } catch (error) {
      return error.message;
    }
  };

  const handleFieldChange = async (field, value) => {
    const error = await validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  useEffect(() => {
    const loadPersonalDetails = async () => {
      try {
        const response = await api.get("personal-details/");
        const data = response.data;
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          date_of_birth: data.date_of_birth
            ? new Date(data.date_of_birth)
            : null,
          phone: data.phone || "",
          address: data.address || "",
          country: data.country || "",
          bio: data.bio || "",
        });
        setIsEdit(data.profile_completed);
      } catch (err) {
        console.error("Error loading personal details:", err);
      }
    };

    loadPersonalDetails();
  }, []);

  const handleInputChange = (field) => (e) => {
    let value = e.target.value;


    switch (field) {
      case "phone":

        value = value.split('').filter(char => {
          return char.match(/[0-9]/) || char === ' ' || char === '-' || char === '(' || char === ')' || char === '+';
        }).join('');
        break;
      case "first_name":
      case "last_name":

        value = value.split('').filter(char => {
          return char.match(/[a-zA-Z]/) || char === ' ' || char === '-' || char === "'";
        }).join('');
        break;
      case "country":

        value = value.split('').filter(char => {
          return char.match(/[a-zA-Z]/) || char === ' ' || char === '-';
        }).join('');
        break;

      default:
        break;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    

    handleFieldChange(field, value);
  };

  const handleDateChange = (newValue) =>
    setFormData((prev) => ({ ...prev, date_of_birth: newValue }));

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setMsg("");
    setLoading(true);

    try {

      try {
        await validationSchema.validate(formData, { abortEarly: false });
        setErrors({});
      } catch (validationError) {
        const newErrors = {};
        validationError.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
        setMsg("Please fix the validation errors above");
        return;
      }

      const submitData = {
        ...formData,
        date_of_birth: formData.date_of_birth
          ? formData.date_of_birth.toISOString().split("T")[0]
          : null,
        profile_completed: true,
      };

      await api.patch("personal-details/", submitData);
      setMsg("Personal details saved successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error saving personal details:", err);
      setMsg(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to save personal details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    const fields = [
      formData.first_name,
      formData.last_name,
      formData.date_of_birth,
      formData.phone,
      formData.address,
      formData.country,
      formData.bio,
    ];
    const completed = fields.filter(
      (field) => field && field.toString().trim()
    ).length;
    return Math.round((completed / fields.length) * 100);
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return (
          formData.first_name && formData.last_name && formData.date_of_birth
        );
      case 1:
        return formData.phone && formData.address && formData.country;
      case 2:
        return formData.bio;
      default:
        return false;
    }
  };

  const canProceedFromStep = (step) => {
    switch (step) {
      case 0:
        return formData.first_name.trim() && formData.last_name.trim();
      case 1:
        return true;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Box>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "primary.main",
                    mx: "auto",
                    mb: 2,
                    fontSize: "2rem",
                  }}
                >
                  <PersonIcon fontSize="inherit" />
                </Avatar>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  Let's get to know you
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Tell us your basic information to personalize your experience
                </Typography>
              </Box>

              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "grey.300",
                  bgcolor: "grey.50",
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Grid
                    container
                    spacing={3}
                    sx={{ maxWidth: 800, mx: "auto" }}
                    justifyContent="center"
                  >
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <BadgeIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          First Name
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={formData.first_name}
                        onChange={handleInputChange("first_name")}
                        required
                        inputProps={{ maxLength: 50 }}
                        variant="outlined"
                        error={!!errors.first_name}
                        helperText={errors.first_name}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            "&:hover": {
                              bgcolor: "white",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <BadgeIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Last Name
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={formData.last_name}
                        onChange={handleInputChange("last_name")}
                        required
                        inputProps={{ maxLength: 50 }}
                        variant="outlined"
                        error={!!errors.last_name}
                        helperText={errors.last_name}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            "&:hover": {
                              bgcolor: "white",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <CakeIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          When were you born?
                        </Typography>
                      </Box>
                      <DatePicker
                        label="Date of Birth"
                        value={formData.date_of_birth}
                        onChange={handleDateChange}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: "outlined",
                            sx: {
                              "& .MuiOutlinedInput-root": {
                                bgcolor: "white",
                                "&:hover": {
                                  bgcolor: "white",
                                },
                              },
                            },
                          },
                        }}
                        maxDate={new Date()}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                    <Typography variant="h6">Profile Completion</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getCompletionPercentage()}
                    sx={{ mb: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {getCompletionPercentage()}% complete
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Box>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "secondary.main",
                    mx: "auto",
                    mb: 2,
                    fontSize: "2rem",
                  }}
                >
                  <PhoneIcon fontSize="inherit" />
                </Avatar>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  How can we reach you?
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Your contact details help us keep you connected (optional)
                </Typography>
              </Box>

              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "grey.300",
                  bgcolor: "grey.50",
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Grid
                    container
                    spacing={3}
                    sx={{ maxWidth: 800, mx: "auto" }}
                    justifyContent="center"
                  >
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <PhoneIcon sx={{ mr: 1, color: "secondary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Phone Number
                        </Typography>
                        <Chip
                          label="Optional"
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        value={formData.phone}
                        onChange={handleInputChange("phone")}
                        inputProps={{ maxLength: 20 }}
                        variant="outlined"
                        placeholder="+1 (555) 123-4567"
                        error={!!errors.phone}
                        helperText={errors.phone}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            height: "56px",
                            "&:hover": {
                              bgcolor: "white",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <CountryIcon sx={{ mr: 1, color: "secondary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Country
                        </Typography>
                        <Chip
                          label="Optional"
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Country"
                        value={formData.country}
                        onChange={handleInputChange("country")}
                        variant="outlined"
                        placeholder="Enter your country"
                        error={!!errors.country}
                        helperText={errors.country}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            height: "56px",
                            "&:hover": {
                              bgcolor: "white",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <HomeIcon sx={{ mr: 1, color: "secondary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Address
                        </Typography>
                        <Chip
                          label="Optional"
                          size="small"
                          variant="outlined"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Your Address"
                        value={formData.address}
                        onChange={handleInputChange("address")}
                        variant="outlined"
                        placeholder="Enter your full address"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            height: "56px",
                            "&:hover": {
                              bgcolor: "white",
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                    <Typography variant="h6">Profile Completion</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getCompletionPercentage()}
                    sx={{ mb: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {getCompletionPercentage()}% complete
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Box>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "success.main",
                    mx: "auto",
                    mb: 2,
                    fontSize: "2rem",
                  }}
                >
                  <InfoIcon fontSize="inherit" />
                </Avatar>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  Tell us about yourself
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Share a bit about who you are (optional)
                </Typography>
              </Box>

              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "grey.300",
                  bgcolor: "grey.50",
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ maxWidth: 800, mx: "auto" }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <EditIcon sx={{ mr: 1, color: "success.main" }} />
                      <Typography variant="subtitle1" fontWeight={500}>
                        About Me
                      </Typography>
                      <Chip
                        label="Optional"
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      label="Bio / About Me"
                      value={formData.bio}
                      onChange={handleInputChange("bio")}
                      multiline
                      rows={6}
                      inputProps={{ maxLength: 500 }}
                      helperText={`${formData.bio.length}/500 characters`}
                      variant="outlined"
                      placeholder="Tell us about your interests, hobbies, profession, or anything you'd like to share..."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          "&:hover": {
                            bgcolor: "white",
                          },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>

              {}
              <Card elevation={2} sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                    <Typography variant="h6">Profile Completion</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getCompletionPercentage()}
                    sx={{ mb: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {getCompletionPercentage()}% complete
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        );

      default:
        return "Unknown step";
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <AccountIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {isEdit ? "Edit Personal Details" : "Complete Your Profile"}
          </Typography>
          {isEdit && (
            <Button
              color="inherit"
              onClick={() => navigate("/dashboard")}
              startIcon={<ArrowBackIcon />}
            >
              Back to Dashboard
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {}
      <Container maxWidth="md" sx={{ px: { xs: 2, md: 4 }, pb: 6 }}>
        {}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={isStepComplete(index)}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-completed": {
                        color: "success.main",
                      },
                      "&.Mui-active": {
                        color: "primary.main",
                      },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {}
        {renderStepContent(activeStep)}

        {}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Back
          </Button>

          <Box sx={{ flex: "1 1 auto" }} />

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !formData.first_name || !formData.last_name}
              startIcon={<SaveIcon />}
              sx={{ minWidth: 180, py: 1.5 }}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Profile"
                : "Complete Profile"}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              onClick={handleNext}
              disabled={!canProceedFromStep(activeStep)}
              endIcon={<ArrowForwardIcon />}
              sx={{ minWidth: 120 }}
            >
              Next
            </Button>
          )}
        </Box>

        {}
        {msg && (
          <Fade in>
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
              <Alert
                severity={msg.includes("successfully") ? "success" : "error"}
                sx={{ maxWidth: 500 }}
                variant="filled"
              >
                {msg}
              </Alert>
            </Box>
          </Fade>
        )}
      </Container>
    </LocalizationProvider>
  );
}
