import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Grid,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Share as ShareIcon,
  Code as CodeIcon,
  QrCode as QrCodeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import QRCode from "qrcode";
import api from "../../api";
import CreateContext from "../context/CreateContext";

export default function CreateShareTab({
  contexts,
  onContextAdded,
  onQrCodeGenerated,
  onEditContext,
  onDeleteContext,
  selectedContextId,
  onSelectedContextChange
}) {
  const [codeMessage, setCodeMessage] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [qrCodeData, setQrCodeData] = useState(null);

  const generateCode = async () => {
    setCodeMessage("");
    if (!selectedContextId) return;

    try {
      const { data } = await api.post("sharecodes/", {
        context_id: Number(selectedContextId),
      });
      const shareCode = data.data?.code || data.code;
      setGeneratedCode(shareCode);
      setCodeMessage(`Code: ${shareCode}`);


      try {
        const qrDataURL = await QRCode.toDataURL(shareCode, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeData(qrDataURL);
      } catch (qrError) {

      }
    } catch (error) {
      setCodeMessage("Failed to generate code");
    }
  };

  const handleViewQrCode = () => {
    if (qrCodeData && onQrCodeGenerated) {
      onQrCodeGenerated(qrCodeData, generatedCode);
    }
  };

  return (
    <Stack spacing={4} sx={{ width: "100%" }}>
      {}
      <CreateContext onCreated={onContextAdded} />

      {}
      <Grid container spacing="3%" sx={{ width: "100%" }}>
        <Grid minWidth="200" width="37%" item xs={12} md={4}>
          <Card elevation={3} sx={{ height: "100%", width: "100%" }}>
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                  alignSelf: "flex-start",
                }}
              >
                <ShareIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">
                  Generate Share Code
                </Typography>
              </Box>

              {!Array.isArray(contexts) || contexts.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No contexts available. Create a context first.
                  </Typography>
                </Box>
              ) : (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Context</InputLabel>
                    <Select
                      value={selectedContextId}
                      label="Select Context"
                      onChange={(e) => onSelectedContextChange(e.target.value)}
                    >
                      {Array.isArray(contexts) && contexts.map((context, index) => (
                        <MenuItem key={context.id || `menu-context-${index}`} value={context.id}>
                          {context.label} — {`${context.given} ${context.family}`.trim()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    startIcon={<CodeIcon />}
                    onClick={generateCode}
                    disabled={!selectedContextId}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Generate Code
                  </Button>

                  {codeMessage && (
                    <Alert
                      severity={
                        codeMessage.includes("Failed") ? "error" : "success"
                      }
                      sx={{ mb: 2, width: "100%" }}
                    >
                      {codeMessage}
                    </Alert>
                  )}

                  {qrCodeData && (
                    <Button
                      variant="outlined"
                      startIcon={<QrCodeIcon />}
                      onClick={handleViewQrCode}
                      fullWidth
                    >
                      View QR Code
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid minWidth="300" width="60%" item xs={12} md={8}>
          <ContextsListCard
            contexts={contexts}
            onEditContext={onEditContext}
            onDeleteContext={onDeleteContext}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}


function ContextsListCard({ contexts, onEditContext, onDeleteContext }) {
  return (
    <Card elevation={3} sx={{ height: "100%", width: "100%" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Contexts ({Array.isArray(contexts) ? contexts.length : 0})
        </Typography>

        {!Array.isArray(contexts) || contexts.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              No contexts created yet.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              height: 350,
              overflowY: "auto",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              "&::-webkit-scrollbar": { width: "8px" },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "grey.100",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "grey.400",
                borderRadius: "4px",
              },
            }}
          >
            <ContextsTable
              contexts={contexts}
              onEditContext={onEditContext}
              onDeleteContext={onDeleteContext}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}


function ContextsTable({ contexts, onEditContext, onDeleteContext }) {
  return (
    <>
      {}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 200px 120px 80px 80px",
          gap: 2,
          p: 2,
          backgroundColor: "grey.50",
          borderBottom: "1px solid",
          borderColor: "divider",
          fontWeight: "bold",
        }}
      >
        <Typography variant="body2" fontWeight="medium">
          Context
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          Name
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          Expires
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          Visibility
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          Actions
        </Typography>
      </Box>

      {}
      {Array.isArray(contexts) && contexts.map((context, index) => (
        <ContextRow
          key={context.id || `context-${index}`}
          context={context}
          index={index}
          total={contexts.length}
          onEditContext={onEditContext}
          onDeleteContext={onDeleteContext}
        />
      ))}
    </>
  );
}


function ContextRow({ context, index, total, onEditContext, onDeleteContext }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 200px 120px 80px 80px",
        gap: 2,
        p: 2,
        backgroundColor:
          index % 2 === 0
            ? "background.paper"
            : "grey.25",
        borderBottom:
          index < total - 1
            ? "1px solid"
            : "none",
        borderColor: "divider",
        transition: "background-color 0.2s",
        "&:hover": {
          backgroundColor: "primary.50",
        },
        alignItems: "center",
      }}
    >
      {}
      <Box>
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{ mb: 0.5 }}
        >
          {context.label}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          {new Date(context.created_at || Date.now()).toLocaleDateString()}
        </Typography>
      </Box>

      {}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {`${context.given || ''} ${context.family || ''}`.trim() || 'N/A'}
      </Typography>

      {}
      <Box>
        {Array.isArray(context.share_codes) && context.share_codes.length > 0 && context.share_codes.some(shareCode => shareCode.expires_at) ? (
          <Typography variant="caption" color="warning.main">
            {new Date(context.share_codes.find(shareCode => shareCode.expires_at)?.expires_at).toLocaleDateString()}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.secondary">
            Never
          </Typography>
        )}
      </Box>

      {}
      <Chip
        label={context.visibility}
        size="small"
        color={
          context.visibility === "public"
            ? "success"
            : context.visibility === "code"
            ? "warning"
            : "default"
        }
        sx={{ fontSize: "0.7rem", maxWidth: "100%" }}
      />

      {}
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton
          color="primary"
          onClick={() => onEditContext(context)}
          size="small"
          title="Edit context name"
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton
          color="error"
          onClick={() => onDeleteContext(context.id)}
          size="small"
          title="Delete context"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}