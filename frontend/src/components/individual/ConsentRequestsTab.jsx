import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
} from "@mui/material";
import {
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import api from "../../api";

export default function ConsentRequestsTab({
  consentRequests,
  onConsentRequestsUpdate,
  onRedemptionsUpdate
}) {
  const handleConsentRequest = async (requestId, status) => {
    try {
      await api.patch(`consent-requests/${requestId}/`, { status });


      const consentResponse = await api.get("consent-requests/");
      const extractedConsentData = consentResponse.data?.data || consentResponse.data;
      onConsentRequestsUpdate(Array.isArray(extractedConsentData) ? extractedConsentData : []);


      const redemptionsResponse = await api.get("redemptions/");
      const extractedRedemptionsData = redemptionsResponse.data?.data || redemptionsResponse.data;
      onRedemptionsUpdate(Array.isArray(extractedRedemptionsData) ? extractedRedemptionsData : []);
    } catch (error) {
      alert("Failed to update consent request. Please try again.");
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} width="100%">
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Consent Requests
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Manage consent requests for your consent-gate contexts
            </Typography>

            {!Array.isArray(consentRequests) || consentRequests.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No consent requests yet. Create consent-gate contexts
                  to receive requests.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {Array.isArray(consentRequests) && consentRequests.map((request, index) => (
                  <Grid item xs={12} key={request.id || `consent-${index}`}>
                    <ConsentRequestCard
                      request={request}
                      onHandleRequest={handleConsentRequest}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}


function ConsentRequestCard({ request, onHandleRequest }) {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor:
          request.status === "pending"
            ? "warning.main"
            : request.status === "approved"
            ? "success.main"
            : "error.main",
        borderRadius: 2,
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 2,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              component="div"
              fontWeight="medium"
            >
              {request.context_label}
            </Typography>
            <Chip
              label={request.status}
              size="small"
              color={
                request.status === "pending"
                  ? "warning"
                  : request.status === "approved"
                  ? "success"
                  : "error"
              }
              sx={{
                fontSize: "0.75rem",
                textTransform: "capitalize",
              }}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 0.5 }}
          >
            <PersonIcon
              sx={{
                fontSize: 16,
                mr: 0.5,
                verticalAlign: "middle",
              }}
            />
            Requested by: {request.requester_name}
          </Typography>

          {request.message && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 0.5, fontStyle: "italic" }}
            >
              "{request.message}"
            </Typography>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
          >
            Requested:{" "}
            {new Date(request.created_at).toLocaleString()}
          </Typography>
        </Box>

        {request.status === "pending" && (
          <Box sx={{ display: "flex", gap: 1, ml: 1 }}>
            <Button
              size="small"
              color="success"
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={() => onHandleRequest(request.id, "approved")}
            >
              Approve
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={() => onHandleRequest(request.id, "denied")}
            >
              Deny
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}