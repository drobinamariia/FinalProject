import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import {
  QrCode as QrCodeIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

export default function QRCodeDialog({
  open,
  onClose,
  qrCodeData,
  generatedCode
}) {
  const downloadQRCode = () => {
    if (qrCodeData) {
      const link = document.createElement("a");
      link.download = `qr-code-${generatedCode}.png`;
      link.href = qrCodeData;
      link.click();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <QrCodeIcon sx={{ mr: 1 }} />
          Share QR Code
        </Box>
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", py: 3 }}>
        {qrCodeData && (
          <Box>
            <img
              src={qrCodeData}
              alt="QR Code"
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Code: {generatedCode}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={downloadQRCode}
        >
          Download QR Code
        </Button>
      </DialogActions>
    </Dialog>
  );
}