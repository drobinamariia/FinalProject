import {
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import api from "../../api";
import { DataTable } from "../ui";

export default function AnalyticsTab({
  redemptions,
  onRedemptionsUpdate
}) {
  const revokeAccess = async (auditId) => {
    try {
      await api.post("revoke-access/", { audit_id: auditId });
      const redemptionsResponse = await api.get("redemptions/");
      const extractedData = redemptionsResponse.data?.data || redemptionsResponse.data;
      onRedemptionsUpdate(Array.isArray(extractedData) ? extractedData : []);
    } catch (error) {
      alert("Failed to revoke access. Please try again.");
    }
  };

  const columns = [
    {
      id: 'context_label',
      label: 'Context',
      field: 'context_label',
      minWidth: 150
    },
    {
      id: 'name_shared',
      label: 'Name Shared',
      render: (item) => `${item.context_given} ${item.context_family}`.trim(),
      minWidth: 150
    },
    {
      id: 'company_name',
      label: 'Company',
      field: 'company_name',
      render: (item) => item.company_name || 'Unknown Company',
      minWidth: 150
    },
    {
      id: 'visibility',
      label: 'Visibility',
      field: 'visibility',
      type: 'chip',
      chipColor: (value) => value === 'public' ? 'success' : value === 'consent' ? 'warning' : 'primary',
      minWidth: 100
    },
    {
      id: 'redeemed_at',
      label: 'Redeemed',
      field: 'redeemed_at',
      type: 'datetime',
      minWidth: 150
    },
    {
      id: 'expires_at',
      label: 'Expires',
      field: 'expires_at',
      type: 'datetime',
      render: (item) => item.expires_at ? new Date(item.expires_at).toLocaleString() : 'Never',
      minWidth: 150
    },
    {
      id: 'actions',
      label: 'Actions',
      type: 'actions',
      minWidth: 100,
      width: 100
    }
  ];

  const actions = [
    {
      buttonText: 'Revoke',
      title: 'Revoke Access',
      color: 'error',
      variant: 'outlined',
      onClick: (item) => revokeAccess(item.id)
    }
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} width="100%">
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Redemption Analytics
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Track which companies have redeemed your share codes
            </Typography>

            <DataTable
              columns={columns}
              data={redemptions}
              actions={actions}
              emptyMessage="No redemptions yet. Share your codes to see analytics here."
              stickyHeader={true}
              maxHeight={400}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}