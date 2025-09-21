import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Stack,
} from "@mui/material";
import { Add as AddIcon, Settings as SettingsIcon } from "@mui/icons-material";
import api from "../../api";

export default function CreateContext({ onCreated = () => {} }) {
  const navigate = useNavigate();
  const [label, setLabel] = useState("");
  const [vis, setVis] = useState("public");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    try {

      if (!label.trim() || !name.trim()) {
        setMsg("Please fill in all required fields.");
        return;
      }

      if (label.length > 40) {
        setMsg("Label must be 40 characters or less.");
        return;
      }


      const nameParts = name.trim().split(/\s+/);
      const given = nameParts[0] || "Unknown";
      const family = nameParts.slice(1).join(" ") || "";


      const { data } = await api.post("contexts/", {
        label: label.trim(),
        visibility: vis,
        given,
        family,
      });

      setMsg("Created ✔");

      setLabel("");
      setName("");

      onCreated(data);
    } catch (err) {
      setMsg(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          Object.values(err.response?.data || {})
            .flat()
            .join(", ") ||
          "Failed to create context. Please try again."
      );
    }
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <AddIcon sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6">Create New Context</Typography>
        </Box>

        <Box component="form" onSubmit={submit}>
          <Grid container spacing={2} alignItems={"center"}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Context Label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
                inputProps={{ maxLength: 40 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={vis}
                  label="Visibility"
                  onChange={(e) => setVis(e.target.value)}
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="code">Code-protected</MenuItem>
                  <MenuItem value="consent">Consent-gate</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., John Doe"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ flexGrow: 1 }}
                  size="large"
                >
                  Quick Create
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate("/create-context")}
                  size="large"
                >
                  Advanced
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {msg && (
            <Alert
              severity={msg.includes("Created") ? "success" : "error"}
              sx={{ mt: 2 }}
            >
              {msg}
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
