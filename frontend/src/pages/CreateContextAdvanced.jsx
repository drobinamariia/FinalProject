import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Switch,
  FormControlLabel,
  Stack,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../api";

export default function CreateContextAdvanced() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    label: "",
    name: "",
    visibility: "public",
    description: "",
    expiryEnabled: false,
    expiryDate: null,
    autoArchiveExpired: false,
    notifyOnRedeem: true,
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  
  const handleInputChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  const handleSwitchChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.checked }));
  const handleDateChange = (newValue) =>
    setFormData((prev) => ({ ...prev, expiryDate: newValue }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      if (!formData.label.trim() || !formData.name.trim()) {
        setMsg("Please fill in all required fields.");
        return;
      }
      if (formData.label.length > 40) {
        setMsg("Label must be 40 characters or less.");
        return;
      }
      const [given, ...rest] = formData.name.trim().split(/\s+/);
      const contextData = {
        label: formData.label.trim(),
        visibility: formData.visibility,
        given,
        family: rest.join(" "),
        notify_on_redeem: formData.notifyOnRedeem,
        auto_archive_expired: formData.autoArchiveExpired,
      };


      if (formData.expiryEnabled && formData.expiryDate) {
        contextData.create_share_code = true;
        contextData.expires_at = formData.expiryDate.toISOString();
      }
      await api.post("contexts/", contextData);
      setMsg("Context created successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch {
      setMsg("Failed to create context. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {}
      <AppBar position="static" color="primary" elevation={1} sx={{ mb: 4 }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowBackIcon />
          </IconButton>
          <SettingsIcon sx={{ mx: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Advanced Context Creation
          </Typography>
        </Toolbar>
      </AppBar>

      {}
      <Container
        component="form"
        maxWidth="lg"
        onSubmit={handleSubmit}
        sx={{ px: { xs: 2, md: 4 }, pb: 6 }}
      >
        <Stack spacing={4}>
          {}
          <Grid
            container
            spacing={3}
            alignItems="stretch"
            justifyContent={"center"}
          >
            {}
            <Grid width={300} item xs={12} md={4} lg={2} display="flex">
              <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <InfoIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Basic Information</Typography>
                  </Box>

                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Context Label"
                      value={formData.label}
                      onChange={handleInputChange("label")}
                      required
                      inputProps={{ maxLength: 40 }}
                      helperText={`${formData.label.length}/40 characters`}
                    />
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={formData.name}
                      onChange={handleInputChange("name")}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Description (Optional)"
                      value={formData.description}
                      onChange={handleInputChange("description")}
                      multiline
                      rows={3}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {}
            <Grid width={350} item xs={12} md={4} lg={2} display="flex">
              <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <SecurityIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Privacy Settings</Typography>
                  </Box>

                  <Stack spacing={2.5}>
                    <FormControl fullWidth>
                      <InputLabel>Visibility</InputLabel>
                      <Select
                        value={formData.visibility}
                        label="Visibility"
                        onChange={handleInputChange("visibility")}
                      >
                        <MenuItem value="public">
                          <Box>
                            <Typography>Public</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Anyone with code can access
                            </Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="code">
                          <Box>
                            <Typography>Code-protected</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Requires additional verification
                            </Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value="consent">
                          <Box>
                            <Typography>Consent-gate</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Requires explicit approval
                            </Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>


                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.autoArchiveExpired}
                            onChange={handleSwitchChange("autoArchiveExpired")}
                            disabled={!formData.expiryEnabled}
                          />
                        }
                        label="Auto-archive when expired"
                        sx={{ display: "block" }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", ml: 4, mb: 1 }}
                      >
                        {formData.expiryEnabled
                          ? "Archive expired contexts"
                          : "Enable expiry to use auto-archive feature"}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.notifyOnRedeem}
                            onChange={handleSwitchChange("notifyOnRedeem")}
                          />
                        }
                        label="Notify when redeemed"
                        sx={{ display: "block" }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", ml: 4 }}
                      >
                        Send notifications when someone accesses this context
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {}
            <Grid width={300} item xs={12} md={4} lg={2} display="flex">
              <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <ScheduleIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6">Expiry</Typography>
                  </Box>

                  <Stack spacing={2.5}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.expiryEnabled}
                          onChange={handleSwitchChange("expiryEnabled")}
                        />
                      }
                      label="Enable expiry"
                    />

                    {formData.expiryEnabled ? (
                      <Box>
                        <DateTimePicker
                          label="Expiry Date"
                          value={formData.expiryDate}
                          onChange={handleDateChange}
                          slotProps={{
                            textField: { fullWidth: true, size: "small" },
                          }}
                          minDateTime={new Date()}
                        />
                        {formData.expiryDate && (
                          <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="caption">
                              Expires {formData.expiryDate.toLocaleDateString()}
                            </Typography>
                          </Alert>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ py: 1, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">
                          No expiry set
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              disabled={loading || !formData.label || !formData.name}
              sx={{ py: 1.5, px: 4, fontSize: "1.1rem", minWidth: 300 }}
            >
              {loading ? "Creating Context..." : "Create Advanced Context"}
            </Button>
          </Box>

          {msg && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Alert
                severity={msg.includes("successfully") ? "success" : "error"}
                sx={{ maxWidth: 500 }}
              >
                {msg}
              </Alert>
            </Box>
          )}
        </Stack>
      </Container>
    </LocalizationProvider>
  );
}
