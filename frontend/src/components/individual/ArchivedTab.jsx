import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
} from "@mui/icons-material";
import api from "../../api";

export default function ArchivedTab({
  archivedContexts,
  onArchivedContextsUpdate,
  onContextsUpdate
}) {
  const deleteArchivedContext = async (contextId) => {
    if (!window.confirm("Permanently delete this archived context?")) return;

    try {
      await api.delete(`contexts/archived/${contextId}/`);
      onArchivedContextsUpdate((previousArchivedContexts) =>
        Array.isArray(previousArchivedContexts)
          ? previousArchivedContexts.filter((context) => context.id !== contextId)
          : []
      );

      const { data } = await api.get("contexts/");
      onContextsUpdate(data);
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} width="100%">
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Archived Contexts
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              View contexts that have been archived when their expiration settings were enabled
            </Typography>

            {!Array.isArray(archivedContexts) || archivedContexts.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body1" color="text.secondary">
                  No archived contexts yet. Contexts with expiration and auto-archive enabled will appear here.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
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
                <ArchivedContextsTable
                  archivedContexts={archivedContexts}
                  onDelete={deleteArchivedContext}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}


function ArchivedContextsTable({ archivedContexts, onDelete }) {
  return (
    <>
      {}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 200px 120px 120px 80px 80px",
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
          Archived
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          Created
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          Visibility
        </Typography>
        <Typography variant="body2" fontWeight="medium">
          Actions
        </Typography>
      </Box>

      {}
      {Array.isArray(archivedContexts) && archivedContexts.map((archivedContext, index) => (
        <ArchivedContextRow
          key={archivedContext.id || `archived-${index}`}
          context={archivedContext}
          index={index}
          total={archivedContexts.length}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}


function ArchivedContextRow({ context, index, total, onDelete }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 200px 120px 120px 80px 80px",
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
          backgroundColor: "warning.50",
        },
        alignItems: "center",
      }}
    >
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
          ID: {context.id}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {`${context.given} ${context.family}`.trim()}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {context.archived_at
          ? new Date(context.archived_at).toLocaleDateString()
          : "N/A"
        }
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {new Date(
          context.created_at || Date.now()
        ).toLocaleDateString()}
      </Typography>

      <Chip
        label="Archived"
        size="small"
        color="warning"
        sx={{ fontSize: "0.7rem", maxWidth: "100%" }}
      />

      <Box sx={{ display: "flex", gap: 0.5 }}>
        <IconButton
          color="error"
          onClick={() => onDelete(context.id)}
          size="small"
          title="Delete archived context"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}