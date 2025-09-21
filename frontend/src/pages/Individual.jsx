import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Person as PersonIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  NotificationImportant as RequestIcon,
  Archive as ArchiveIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Public as CountryIcon,
  Info as InfoIcon,
  PhotoCamera as PhotoIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../api";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useIndividualData } from "../hooks/useDashboardData";
import { useFormHandler } from "../hooks/useFormHandler";
import { extractResponseData } from "../utils/apiResponseHandler";
import {
  CreateShareTab,
  AnalyticsTab,
  ConsentRequestsTab,
  ArchivedTab,
  QRCodeDialog,
} from "../components/individual";

export default function Individual() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Custom hooks for data management
  const {
    contexts,
    setContexts,
    archivedContexts,
    setArchivedContexts,
    redemptions,
    setRedemptions,
    consentRequests,
    setConsentRequests,
    profileData,
    notifications,
    unreadCount,
    notificationAnchor,
    loadAllData,
    refreshTabData,
    refreshWithExpiredCheck,
    forceRefreshProfile,
    handleNotificationClick,
    handleNotificationClose,
    markNotificationAsRead,
  } = useIndividualData();

  // Component state
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedContextId, setSelectedContextId] = useState("");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingContext, setEditingContext] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Profile form handler
  const profileForm = useFormHandler({
    first_name: "",
    last_name: "",
    date_of_birth: null,
    phone: "",
    address: "",
    country: "",
    bio: "",
    profile_picture: null,
    is_public_profile: false,
  });

  // Profile edit function
  const openProfileEdit = useCallback(async () => {
    try {
      const response = await api.get("personal-details/");
      const userProfileData = extractResponseData(response);
      profileForm.updateFormData(userProfileData);
      setImagePreview(null);
      setProfileEditOpen(true);
    } catch (error) {
      console.error("Failed to load profile data:", error);
    }
  }, [profileForm]);

  // Set selected context when contexts are loaded
  useEffect(() => {
    if (Array.isArray(contexts) && contexts.length && !selectedContextId) {
      setSelectedContextId(String(contexts[0].id));
    }
  }, [contexts, selectedContextId]);

  // Initial load of all contexts and redemptions
  useEffect(() => {
    refreshWithExpiredCheck();
  }, [refreshWithExpiredCheck]);

  // Check for openProfile parameter and open profile edit for new users
  useEffect(() => {
    const shouldOpenProfile = searchParams.get("openProfile");
    if (shouldOpenProfile === "true") {
      setSearchParams({});
      setTimeout(() => {
        openProfileEdit();
      }, 500);
    }
  }, [searchParams, setSearchParams, openProfileEdit]);

  // Auto-refresh data when switching tabs
  useEffect(() => {
    if (currentTab > 0) {
      refreshTabData(currentTab);
    }
  }, [currentTab, refreshTabData]);

  // Add new context to the list
  const addContext = (responseData) => {
    const newContext = responseData.data || responseData;
    setContexts((previousContexts) => [...previousContexts, newContext]);
  };

  // Handle QR code generation
  const handleQrCodeGenerated = (qrData, code) => {
    setQrCodeData(qrData);
    setGeneratedCode(code);
    setQrDialogOpen(true);
  };

  // Context management functions
  const openEditDialog = (contextToEdit) => {
    setEditingContext(contextToEdit);
    setEditLabel(contextToEdit.label);
    setEditDialogOpen(true);
  };

  const deleteContext = async (contextId) => {
    if (!window.confirm("Delete this context?")) return;
    try {
      await api.delete(`contexts/${contextId}/`);
      setContexts((previousContexts) =>
        Array.isArray(previousContexts)
          ? previousContexts.filter((context) => context.id !== contextId)
          : []
      );
      if (
        String(contextId) === selectedContextId &&
        Array.isArray(contexts) &&
        contexts.length > 1
      ) {
        setSelectedContextId(
          String(
            Array.isArray(contexts)
              ? contexts.find((context) => context.id !== contextId)?.id || ""
              : ""
          )
        );
      }
    } catch (error) {
      alert(
        `Delete failed: ${
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message
        }`
      );
    }
  };

  // Context edit handlers
  const handleEditSave = async () => {
    if (!editingContext || !editLabel.trim()) return;

    try {
      await api.patch(`contexts/${editingContext.id}/`, {
        label: editLabel.trim(),
      });

      setContexts((prevContexts) =>
        Array.isArray(prevContexts)
          ? prevContexts.map((context) =>
              context.id === editingContext.id
                ? { ...context, label: editLabel.trim() }
                : context
            )
          : []
      );

      setEditDialogOpen(false);
      setEditingContext(null);
      setEditLabel("");
    } catch (error) {
      alert("Failed to update context. Please try again.");
    }
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingContext(null);
    setEditLabel("");
  };

  // Profile edit handlers
  const handleProfileSave = async () => {
    try {
      const formData = new FormData();
      Object.entries(profileForm.formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === "date_of_birth" && value instanceof Date) {
            formData.append(key, value.toISOString().split("T")[0]);
          } else {
            formData.append(key, value);
          }
        }
      });

      await api.patch("personal-details/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfileEditOpen(false);
      forceRefreshProfile();
    } catch (error) {
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      profileForm.updateFormData({ profile_picture: file });
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Header */}
        <DashboardHeader
          userRole="individual"
          title="Individual Dashboard"
          icon={PersonIcon}
          profileData={profileData}
          notifications={notifications}
          unreadCount={unreadCount}
          notificationAnchor={notificationAnchor}
          onNotificationClick={handleNotificationClick}
          onNotificationClose={handleNotificationClose}
          onProfileClick={openProfileEdit}
          onMarkNotificationAsRead={markNotificationAsRead}
        />

        {/* Welcome Message */}
        {profileData && profileData.first_name && (
          <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 }, mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ color: "text.primary", fontWeight: "medium" }}
            >
              Welcome back, {profileData.first_name}!
            </Typography>
          </Container>
        )}

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 }, pb: 6 }}>
          {/* Tabs */}
          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
            >
              <Tab icon={<AddIcon />} label="Create & Share" />
              <Tab icon={<DashboardIcon />} label="Analytics Dashboard" />
              <Tab
                icon={<RequestIcon />}
                label={`Consent Requests ${
                  Array.isArray(consentRequests) &&
                  consentRequests.filter((req) => req.status === "pending")
                    .length > 0
                    ? `(${
                        Array.isArray(consentRequests) &&
                        consentRequests.filter(
                          (req) => req.status === "pending"
                        ).length
                      })`
                    : ""
                }`}
              />
              <Tab
                icon={<ArchiveIcon />}
                label={`Archived (${
                  Array.isArray(archivedContexts) ? archivedContexts.length : 0
                })`}
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {currentTab === 0 && (
            <CreateShareTab
              contexts={contexts}
              onContextAdded={addContext}
              onQrCodeGenerated={handleQrCodeGenerated}
              onEditContext={openEditDialog}
              onDeleteContext={deleteContext}
              selectedContextId={selectedContextId}
              onSelectedContextChange={setSelectedContextId}
            />
          )}

          {currentTab === 1 && (
            <AnalyticsTab
              redemptions={redemptions}
              onRedemptionsUpdate={setRedemptions}
            />
          )}

          {currentTab === 2 && (
            <ConsentRequestsTab
              consentRequests={consentRequests}
              onConsentRequestsUpdate={setConsentRequests}
              onRedemptionsUpdate={setRedemptions}
            />
          )}

          {currentTab === 3 && (
            <ArchivedTab
              archivedContexts={archivedContexts}
              onArchivedContextsUpdate={setArchivedContexts}
              onContextsUpdate={setContexts}
            />
          )}
        </Container>

        {/* QR Code Dialog */}
        <QRCodeDialog
          open={qrDialogOpen}
          onClose={() => setQrDialogOpen(false)}
          qrCodeData={qrCodeData}
          generatedCode={generatedCode}
        />

        {/* Edit Context Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleEditCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Context</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Context Label"
              fullWidth
              variant="outlined"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditCancel}>Cancel</Button>
            <Button onClick={handleEditSave} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Profile Edit Dialog */}
        <Dialog
          open={profileEditOpen}
          onClose={() => setProfileEditOpen(false)}
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
              <PersonIcon sx={{ mr: 1.5, fontSize: 28 }} />
              <Typography variant="h5" fontWeight={600}>
                Edit Personal Profile
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Update your personal information
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: 2, pb: 1 }}>
            {/* Personal Information Card */}
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
                    First Name
                  </Typography>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileForm.formData.first_name || ""}
                    onChange={(e) =>
                      profileForm.updateFormData({ first_name: e.target.value })
                    }
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
                    Last Name
                  </Typography>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileForm.formData.last_name || ""}
                    onChange={(e) =>
                      profileForm.updateFormData({ last_name: e.target.value })
                    }
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

                <Box sx={{ width: "50%" }}>
                  <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                    Date of Birth
                  </Typography>
                  <DatePicker
                    label="Date of Birth"
                    value={profileForm.formData.date_of_birth}
                    onChange={(newValue) =>
                      profileForm.updateFormData({ date_of_birth: newValue })
                    }
                    renderInput={(params) =>
                      <TextField
                        {...params}
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "white",
                            "&:hover": {
                              bgcolor: "white",
                            },
                          },
                        }}
                      />
                    }
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
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
                      value={profileForm.formData.phone || ""}
                      onChange={(e) =>
                        profileForm.updateFormData({ phone: e.target.value })
                      }
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
                      Country
                    </Typography>
                    <TextField
                      fullWidth
                      label="Country"
                      value={profileForm.formData.country || ""}
                      onChange={(e) =>
                        profileForm.updateFormData({ country: e.target.value })
                      }
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
                      Address
                    </Typography>
                    <TextField
                      fullWidth
                      label="Address"
                      value={profileForm.formData.address || ""}
                      onChange={(e) =>
                        profileForm.updateFormData({ address: e.target.value })
                      }
                      multiline
                      rows={2}
                      variant="outlined"
                      placeholder="Enter your address"
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

            {/* Bio and Profile Picture Card */}
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "grey.300",
                bgcolor: "grey.50",
                mb: 3,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <TextField
                  fullWidth
                  label="Bio"
                  value={profileForm.formData.bio || ""}
                  onChange={(e) =>
                    profileForm.updateFormData({ bio: e.target.value })
                  }
                  multiline
                  rows={4}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${(profileForm.formData.bio || '').length}/1000 characters`}
                  variant="outlined"
                  placeholder="Tell others about yourself..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '&:hover': { bgcolor: 'white' },
                    }
                  }}
                />

                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 1 }}>
                    Profile Picture
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <input
                      accept="image/*"
                      type="file"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                      id="profile-picture-upload"
                    />
                    <label htmlFor="profile-picture-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        sx={{ minWidth: 200 }}
                      >
                        Upload Profile Picture
                      </Button>
                    </label>
                    {imagePreview && (
                      <Avatar
                        src={imagePreview}
                        sx={{ width: 80, height: 80 }}
                      />
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileForm.formData.is_public_profile || false}
                        onChange={(e) =>
                          profileForm.updateFormData({
                            is_public_profile: e.target.checked,
                          })
                        }
                        color="primary"
                      />
                    }
                    label="Make my profile searchable and public"
                  />
                </Box>
              </CardContent>
            </Card>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              onClick={() => setProfileEditOpen(false)}
              variant="outlined"
              size="large"
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleProfileSave}
              size="large"
              sx={{ minWidth: 150 }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
