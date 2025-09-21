import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Domain as CompanyIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import api from "../../api";

const companySizes = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees"
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
  "Other"
];

export default function CompanyProfileEditDialog({ open, onClose, onSave }) {
  const [profileEditData, setProfileEditData] = useState({
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
  const [profileEditLoading, setProfileEditLoading] = useState(false);


  useEffect(() => {
    if (open) {
      loadCompanyData();
    }
  }, [open]);

  const loadCompanyData = async () => {
    try {
      const response = await api.get("company-details/");
      const data = response.data;
      setProfileEditData({
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
    } catch (err) {
      console.error('Error loading company details:', err);
    }
  };

  const handleProfileInputChange = (fieldName) => (event) => {
    setProfileEditData((prev) => ({
      ...prev,
      [fieldName]: event.target.value,
    }));
  };

  const handleProfileEditSave = async () => {
    setProfileEditLoading(true);
    try {
      const submitData = {
        ...profileEditData,
        company_founded: profileEditData.company_founded ? parseInt(profileEditData.company_founded) : null,
        profile_completed: true,
      };

      await api.patch("company-details/", submitData);
      onClose();
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error("Error saving company details:", err);
    } finally {
      setProfileEditLoading(false);
    }
  };

  const handleProfileEditCancel = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleProfileEditCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          borderRadius: 3,
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <BusinessIcon sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600}>
Edit Company Profile
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Update your company information
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {}
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                Company Name
              </Typography>
              <TextField
                fullWidth
                label="Company Name"
                value={profileEditData.company_name}
                onChange={handleProfileInputChange("company_name")}
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
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                Industry
              </Typography>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Industry</InputLabel>
                <Select
                  value={profileEditData.company_industry}
                  label="Industry"
                  onChange={handleProfileInputChange("company_industry")}
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
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                Company Size
              </Typography>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={profileEditData.company_size}
                  label="Company Size"
                  onChange={handleProfileInputChange("company_size")}
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
            </Box>

            <Box sx={{ width: "50%" }}>
              <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                Founded Year
              </Typography>
              <TextField
                fullWidth
                label="Founded Year"
                value={profileEditData.company_founded}
                onChange={handleProfileInputChange("company_founded")}
                type="number"
                inputProps={{ min: 1800, max: new Date().getFullYear() }}
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
            </Box>
          </CardContent>
        </Card>

        {}
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
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                  Phone Number
                </Typography>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={profileEditData.company_phone}
                  onChange={handleProfileInputChange("company_phone")}
                  inputProps={{ maxLength: 20 }}
                  variant="outlined"
                  placeholder="+1 (555) 123-4567"
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
                <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                  Website
                </Typography>
                <TextField
                  fullWidth
                  label="Website"
                  value={profileEditData.company_website}
                  onChange={handleProfileInputChange("company_website")}
                  variant="outlined"
                  placeholder="https://yourcompany.com"
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
                <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                  Country
                </Typography>
                <TextField
                  fullWidth
                  label="Country"
                  value={profileEditData.company_country}
                  onChange={handleProfileInputChange("company_country")}
                  variant="outlined"
                  placeholder="Enter your country"
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
                <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                  Business Address
                </Typography>
                <TextField
                  fullWidth
                  label="Business Address"
                  value={profileEditData.company_address}
                  onChange={handleProfileInputChange("company_address")}
                  multiline
                  rows={2}
                  variant="outlined"
                  placeholder="Enter your business address"
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
        <Card elevation={0} sx={{ 
          border: '1px solid',
          borderColor: 'grey.300',
          bgcolor: 'grey.50'
        }}>
          <CardContent sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Company Description"
              value={profileEditData.company_description}
              onChange={handleProfileInputChange("company_description")}
              multiline
              rows={4}
              inputProps={{ maxLength: 1000 }}
              helperText={`${profileEditData.company_description.length}/1000 characters`}
              variant="outlined"
              placeholder="Describe your company's mission, services, values, or anything that makes you unique..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'white' },
                }
              }}
            />
          </CardContent>
        </Card>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={handleProfileEditCancel} 
          disabled={profileEditLoading}
          variant="outlined"
          size="large"
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleProfileEditSave}
          disabled={profileEditLoading || !profileEditData.company_name}
          size="large"
          sx={{ minWidth: 150 }}
        >
          {profileEditLoading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}