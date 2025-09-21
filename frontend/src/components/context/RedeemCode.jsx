import { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Paper,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Redeem as RedeemIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Send as SendIcon
} from '@mui/icons-material';
import api from "../../api";

export default function RedeemCode({ onConsentRequested, onRedemptionSuccess }) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [redemptionData, setRedemptionData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [consentInfo, setConsentInfo] = useState(null);
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [consentMessage, setConsentMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setIsSuccess(false);
    setRedemptionData(null);
    setConsentInfo(null);
    
    try {
      const { data } = await api.get(`codes/${code}/`, {
        headers: { "X-Client": "frontend_react" },
      });


      const extractedData = data.data || data;
      setRedemptionData(extractedData);
      setIsSuccess(true);
      setMsg("Code redeemed successfully!");
      setCode("");
      

      if (onRedemptionSuccess) {
        onRedemptionSuccess();
      }
    } catch (err) {
      setIsSuccess(false);
      

      if (err.response?.status === 403 && err.response?.data?.errors?.requires_consent) {
        setConsentInfo(err.response.data.errors);
        setConsentDialogOpen(true);
        setMsg("This context requires consent. Please request access first.");
      } else {
        setMsg(
          err.response?.data?.detail || 
          err.response?.data?.error || 
          err.response?.data?.message ||
          "Failed to redeem code. Please check the code and try again."
        );
      }
    }
  }

  const requestConsent = async () => {
    try {
      await api.post('consent-request-by-code/', {
        code: code,
        message: consentMessage
      });
      
      setConsentDialogOpen(false);
      setConsentMessage("");
      setIsSuccess(true);
      setMsg("Consent request sent successfully! You will be notified when approved.");
      

      if (onConsentRequested) {
        onConsentRequested();
      }
    } catch (err) {
      setMsg(
        err.response?.data?.error || 
        "Failed to send consent request. Please try again."
      );
    }
  };

  const downloadData = () => {
    if (redemptionData) {
      const jsonData = {
        name: `${redemptionData.given || ''} ${redemptionData.family || ''}`.trim(),
        context: redemptionData.label,
        code: code || 'N/A',
        redeemed_at: new Date().toISOString(),
        id: Date.now()
      };

      const dataStr = JSON.stringify(jsonData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${jsonData.name.replace(/\s+/g, '_')}_${jsonData.context.replace(/\s+/g, '_')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <RedeemIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5">Redeem Share Code</Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter a share code to access shared context information
        </Typography>
        
        <Box component="form" onSubmit={submit}>
          <TextField
            fullWidth
            label="Share Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the share code here..."
            required
            sx={{ mb: 2 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            startIcon={<RedeemIcon />}
            disabled={!code.trim()}
            fullWidth
            size="large"
          >
            Redeem Code
          </Button>
        </Box>
        
        {msg && (
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={isSuccess ? "success" : "error"}
              icon={isSuccess ? <CheckCircleIcon /> : undefined}
            >
              {msg}
            </Alert>
          </Box>
        )}

        {isSuccess && redemptionData && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Contact Information Retrieved
            </Typography>
            
            <Paper 
              elevation={1} 
              sx={{ 
                p: 3, 
                backgroundColor: 'grey.50',
                border: '1px solid',
                borderColor: 'success.main'
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {`${redemptionData.given || ''} ${redemptionData.family || ''}`.trim() || 'Unknown User'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Context:
                  </Typography>
                  <Typography variant="body1">
                    {redemptionData.label}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Visibility:
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {redemptionData.visibility}
                  </Typography>
                </Box>
                
                {redemptionData.expires_at && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Expires:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(redemptionData.expires_at).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={downloadData}
                color="success"
                size="large"
              >
                Download Complete Data (JSON)
              </Button>
            </Box>
          </Box>
        )}
        
        {}
        <Dialog 
          open={consentDialogOpen} 
          onClose={() => setConsentDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SecurityIcon sx={{ mr: 1 }} />
              Consent Required
            </Box>
          </DialogTitle>
          <DialogContent>
            {consentInfo && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  This context requires explicit consent from the owner.
                </Typography>
                
                <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.50', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Context:</strong> {consentInfo.context_label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Owner:</strong> {consentInfo.owner}
                  </Typography>
                </Paper>
                
                <TextField
                  fullWidth
                  label="Request Message (Optional)"
                  multiline
                  rows={3}
                  value={consentMessage}
                  onChange={(e) => setConsentMessage(e.target.value)}
                  placeholder="Explain why you need access to this information..."
                  sx={{ mt: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConsentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SendIcon />}
              onClick={requestConsent}
            >
              Send Request
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
