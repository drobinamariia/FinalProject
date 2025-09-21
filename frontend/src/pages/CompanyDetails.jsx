import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Business as BusinessIcon,
  Save as SaveIcon,
  AccountCircle as AccountIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Phone as PhoneIcon,
  Public as WebsiteIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Domain as CompanyIcon,
  Group as PeopleIcon,
  TrendingUp as IndustryIcon,
  CalendarToday as FoundedIcon,
  Language as CountryIcon,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../api";

const steps = ["Company Info", "Contact Details", "About Company"];

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Consulting",
  "Media & Entertainment",
  "Transportation",
  "Energy",
  "Non-profit",
  "Government",
  "Other",
];

export default function CompanyDetails() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    company_name: "",
    company_industry: "",
    company_size: "",
    company_founded: "",
    company_phone: "",
    company_address: "",
    company_country: "",
    company_website: "",
    company_description: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    // Loads existing company details from API or sets up form for new entry
    const loadCompanyDetails = async () => {
      try {
        const response = await api.get("company-details/");
        const data = response.data;
        setFormData({
          company_name: data.company_name || "",
          company_industry: data.company_industry || "",
          company_size: data.company_size || "",
          company_founded: data.company_founded || "",
          company_phone: data.company_phone || "",
          company_address: data.company_address || "",
          company_country: data.company_country || "",
          company_website: data.company_website || "",
          company_description: data.company_description || "",
        });
        setIsEdit(data.profile_completed);
      } catch (err) {
        console.error("Error loading company details:", err);
      }
    };

    loadCompanyDetails();
  }, []);

  // Handles form input changes with field-specific validation and filtering
  const handleInputChange = (field) => (e) => {
    let value = e.target.value;

    switch (field) {
      case "company_phone":
        value = value
          .split("")
          .filter((char) => {
            return (
              char.match(/[0-9]/) ||
              char === " " ||
              char === "-" ||
              char === "(" ||
              char === ")" ||
              char === "+"
            );
          })
          .join("");
        break;
      case "company_name":
        value = value
          .split("")
          .filter((char) => {
            return (
              char.match(/[a-zA-Z0-9]/) ||
              char === " " ||
              char === "-" ||
              char === "&" ||
              char === "." ||
              char === "'" ||
              char === "," ||
              char === "(" ||
              char === ")"
            );
          })
          .join("");
        break;
      case "company_country":
        value = value
          .split("")
          .filter((char) => {
            return char.match(/[a-zA-Z]/) || char === " " || char === "-";
          })
          .join("");
        break;

      default:
        break;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Advances to the next step in the company setup wizard
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Goes back to the previous step in the company setup wizard
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Submits company details and navigates to dashboard on success
  const handleSubmit = async () => {
    setMsg("");
    setLoading(true);

    try {
      if (!formData.company_name.trim()) {
        setMsg("Company name is required.");
        return;
      }

      const submitData = {
        ...formData,
        company_founded: formData.company_founded
          ? parseInt(formData.company_founded)
          : null,
        profile_completed: true,
      };

      await api.patch("company-details/", submitData);
      setMsg("Company details saved successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Error saving company details:", err);
      setMsg(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to save company details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculates completion percentage based on filled form fields
  const getCompletionPercentage = () => {
    const fields = [
      formData.company_name,
      formData.company_industry,
      formData.company_size,
      formData.company_founded,
      formData.company_phone,
      formData.company_address,
      formData.company_country,
      formData.company_website,
      formData.company_description,
    ];
    const completed = fields.filter(
      (field) => field && field.toString().trim()
    ).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Checks if all required fields for a specific step are completed
  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return (
          formData.company_name &&
          formData.company_industry &&
          formData.company_size
        );
      case 1:
        return (
          formData.company_phone &&
          formData.company_address &&
          formData.company_country
        );
      case 2:
        return formData.company_description;
      default:
        return false;
    }
  };

  // Determines if user can advance from current step based on minimum requirements
  const canProceedFromStep = (step) => {
    switch (step) {
      case 0:
        return formData.company_name.trim();
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
                  <BusinessIcon fontSize="inherit" />
                </Avatar>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  Tell us about your company
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Help us understand your business better
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
                        <CompanyIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Company Name
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        label="Company Name"
                        value={formData.company_name}
                        onChange={handleInputChange("company_name")}
                        required
                        inputProps={{ maxLength: 200 }}
                        variant="outlined"
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
                        <IndustryIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Industry
                        </Typography>
                      </Box>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel>Industry</InputLabel>
                        <Select
                          value={formData.company_industry}
                          label="Industry"
                          onChange={handleInputChange("company_industry")}
                          required
                          sx={{
                            bgcolor: "white",
                            "&:hover": { bgcolor: "white" },
                          }}
                        >
                          {industries.map((industry) => (
                            <MenuItem key={industry} value={industry}>
                              {industry}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Company Size
                        </Typography>
                      </Box>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel>Company Size</InputLabel>
                        <Select
                          value={formData.company_size}
                          label="Company Size"
                          onChange={handleInputChange("company_size")}
                          required
                          sx={{
                            bgcolor: "white",
                            "&:hover": { bgcolor: "white" },
                          }}
                        >
                          {companySizes.map((size) => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <FoundedIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Year Founded
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        label="Year Founded"
                        value={formData.company_founded}
                        onChange={handleInputChange("company_founded")}
                        required
                        type="number"
                        inputProps={{
                          min: 1800,
                          max: new Date().getFullYear(),
                        }}
                        variant="outlined"
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
                  How can clients reach you?
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Your contact details help clients connect with your business
                  (optional)
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
                        value={formData.company_phone}
                        onChange={handleInputChange("company_phone")}
                        inputProps={{ maxLength: 20 }}
                        variant="outlined"
                        placeholder="+1 (555) 123-4567"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            height: "56px",
                            "&:hover": { bgcolor: "white" },
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <WebsiteIcon sx={{ mr: 1, color: "secondary.main" }} />
                        <Typography variant="subtitle1" fontWeight={500}>
                          Website
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
                        label="Company Website"
                        value={formData.company_website}
                        onChange={handleInputChange("company_website")}
                        variant="outlined"
                        placeholder="https://yourcompany.com"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            height: "56px",
                            "&:hover": { bgcolor: "white" },
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
                          Business Address
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
                        label="Business Address"
                        value={formData.company_address}
                        onChange={handleInputChange("company_address")}
                        variant="outlined"
                        placeholder="Enter your business address"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            height: "56px",
                            "&:hover": { bgcolor: "white" },
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
                  Tell us about your business
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Share what makes your company unique (optional)
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
                        Company Description
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
                      label="Company Description"
                      value={formData.company_description}
                      onChange={handleInputChange("company_description")}
                      multiline
                      rows={6}
                      inputProps={{ maxLength: 1000 }}
                      helperText={`${formData.company_description.length}/1000 characters`}
                      variant="outlined"
                      placeholder="Describe your company's mission, services, values, or anything that makes you unique..."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          bgcolor: "white",
                          "&:hover": { bgcolor: "white" },
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
            {isEdit ? "Edit Company Details" : "Complete Your Company Profile"}
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
              disabled={loading || !formData.company_name}
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
