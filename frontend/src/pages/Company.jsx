import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Redeem as RedeemIcon,
  Analytics as AnalyticsIcon,
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  NotificationImportant as RequestIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import RedeemCode from "../components/context/RedeemCode";
import CompanyProfileEditDialog from "../components/profile/CompanyProfileEditDialog";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { useCompanyData } from "../hooks/useDashboardData";
import api from "../api";







export default function Company() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    redemptions,
    setRedemptions,
    pendingRequests,
    setPendingRequests,
    profileData,
    notifications,
    unreadCount,
    notificationAnchor,
    loadRedemptions,
    loadPendingRequests,
    loadAllData,
    refreshWithExpiredCheck,
    handleNotificationClick,
    handleNotificationClose,
    markNotificationAsRead
  } = useCompanyData();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isProfileEditDialogOpen, setIsProfileEditDialogOpen] = useState(false);

  useEffect(() => {
    refreshWithExpiredCheck();
  }, [refreshWithExpiredCheck]);


  useEffect(() => {
    const shouldOpenProfile = searchParams.get('openProfile');
    if (shouldOpenProfile === 'true') {
      setSearchParams({});
      setTimeout(() => {
        handleOpenProfileEdit();
      }, 500);
    }
  }, [searchParams, setSearchParams]);

  const handleOpenProfileEdit = () => {
    setIsProfileEditDialogOpen(true);
  };

  const handleCloseProfileEdit = () => {
    setIsProfileEditDialogOpen(false);
  };

  const handleSaveProfileEdit = () => {
    refreshWithExpiredCheck();
  };

  const handleDownloadAllData = () => {
    if (!Array.isArray(redemptions) || redemptions.length === 0) {
      alert("No data to download");
      return;
    }

    const jsonString = JSON.stringify(redemptions, null, 2);
    const dataBlob = new Blob([jsonString], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(dataBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = `company-redemptions-${new Date().getTime()}.json`;
    downloadLink.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleDownloadSingleContact = (redemptionData) => {
    const contactData = {
      name: redemptionData.name,
      context: redemptionData.context,
      code: redemptionData.code,
      redeemed_at: redemptionData.redeemed_at,
      id: redemptionData.id
    };

    const jsonString = JSON.stringify(contactData, null, 2);
    const dataBlob = new Blob([jsonString], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(dataBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = downloadUrl;
    downloadLink.download = `${redemptionData.name.replace(/\s+/g, '_')}_${redemptionData.context.replace(/\s+/g, '_')}.json`;
    downloadLink.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleDeleteRedemption = async (redemptionId) => {
    const confirmDelete = window.confirm("Delete this redemption record? This will remove it from your list permanently.");
    if (!confirmDelete) return;

    try {
      await api.delete(`company-redemptions/${redemptionId}/`);
      setRedemptions((previousRedemptions) =>
        Array.isArray(previousRedemptions)
          ? previousRedemptions.filter((redemption) => redemption.id !== redemptionId)
          : []
      );
    } catch (error) {
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.message ||
                          error.message;
      alert(`Delete failed: ${errorMessage}`);
    }
  };

  return (
    <Box>
      <DashboardHeader
        userRole="company"
        title="Company Dashboard"
        icon={BusinessIcon}
        profileData={profileData}
        notifications={notifications}
        unreadCount={unreadCount}
        notificationAnchor={notificationAnchor}
        onNotificationClick={handleNotificationClick}
        onNotificationClose={handleNotificationClose}
        onProfileClick={handleOpenProfileEdit}
        onMarkNotificationAsRead={markNotificationAsRead}
      />

      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 }, pb: 6 }}>
        <Paper sx={{ mb: 4 }}>
          <Tabs value={activeTabIndex} onChange={(event, newTabIndex) => setActiveTabIndex(newTabIndex)}>
            <Tab
              icon={<RedeemIcon />}
              label={`Redeem & Requests ${pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}`}
            />
            <Tab icon={<AnalyticsIcon />} label="Redeemed Data" />
          </Tabs>
        </Paper>

        {activeTabIndex === 0 && (
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1, minHeight: 400 }}>
              <RedeemCode
                onConsentRequested={loadPendingRequests}
                onRedemptionSuccess={loadRedemptions}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Card elevation={3} sx={{ height: '100%' }}>
                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom>
                    Pending Consent Requests
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Requests waiting for approval from context owners
                  </Typography>

                  {!Array.isArray(pendingRequests) || pendingRequests.length === 0 ? (
                    <Box sx={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 300,
                      textAlign: 'center'
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        No pending requests. All your consent requests have been processed.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{
                      height: 400,
                      overflowY: 'auto',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&::-webkit-scrollbar': { width: '8px' },
                      '&::-webkit-scrollbar-track': { backgroundColor: 'grey.100' },
                      '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.400', borderRadius: '4px' }
                    }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        backgroundColor: 'grey.50',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      }}>
                        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 'bold' }}>
                          Context
                        </Typography>
                        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 'bold' }}>
                          Owner
                        </Typography>
                        <Typography variant="subtitle2" sx={{ width: 120, fontWeight: 'bold' }}>
                          Status
                        </Typography>
                      </Box>

                      {Array.isArray(pendingRequests) && pendingRequests.map((consentRequest, requestIndex) => (
                        <Box
                          key={consentRequest.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderBottom: requestIndex < (Array.isArray(pendingRequests) ? pendingRequests.length : 0) - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            '&:hover': {
                              backgroundColor: 'action.hover'
                            }
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {consentRequest.context_label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(consentRequest.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2">
                              {consentRequest.context_owner}
                            </Typography>
                          </Box>
                          <Box sx={{ width: 120 }}>
                            <Chip
                              label="Pending"
                              size="small"
                              color="warning"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {activeTabIndex === 1 && (
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Redeemed Contacts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    View all the contact information you've accessed through share codes
                  </Typography>
                </Box>
                {Array.isArray(redemptions) && redemptions.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadAllData}
                    color="primary"
                  >
                    Download All JSON
                  </Button>
                )}
              </Box>

              {!Array.isArray(redemptions) || redemptions.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No redemptions yet. Use the "Redeem Codes" tab to access shared information.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={1}>
                  <Table sx={{ minWidth: 650 }} aria-label="redemptions table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.50' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Context</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Visibility</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Expires</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Redeemed</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(redemptions) && redemptions.map((redemptionData) => (
                        <TableRow
                          key={redemptionData.id}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: 'action.hover',
                            },
                            '&:hover': {
                              backgroundColor: 'action.selected',
                            },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            <Typography variant="body2" fontWeight="medium">
                              {redemptionData.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {redemptionData.context}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {redemptionData.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {redemptionData.visibility}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {redemptionData.expires_at ? (
                              <Typography variant="body2" color="warning.main">
                                {new Date(redemptionData.expires_at).toLocaleString()}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Never
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(redemptionData.redeemed_at).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Active"
                              size="small"
                              color="success"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadSingleContact(redemptionData)}
                                sx={{
                                  minWidth: 'auto',
                                  px: 1.5,
                                  textTransform: 'none',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Download
                              </Button>
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteRedemption(redemptionData.id)}
                                size="small"
                                title="Delete redemption record"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        <CompanyProfileEditDialog
          open={isProfileEditDialogOpen}
          onClose={handleCloseProfileEdit}
          onSave={handleSaveProfileEdit}
        />

        <Popover
          open={Boolean(notificationAnchor)}
          anchorEl={notificationAnchor}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Paper sx={{ width: 400, maxHeight: 500, overflow: "auto" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6">Notifications</Typography>
            </Box>

            {!Array.isArray(notifications) || notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No notifications yet
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {Array.isArray(notifications) && notifications.slice(0, 10).map((notificationItem, notificationIndex) => (
                  <div key={notificationItem.id}>
                    <ListItem
                      sx={{
                        backgroundColor: notificationItem.read
                          ? "transparent"
                          : "action.hover",
                        cursor: "pointer",
                      }}
                      onClick={() => markNotificationAsRead(notificationItem.id)}
                    >
                      <ListItemIcon>
                        {notificationItem.type === "redemption" && (
                          <CodeIcon color="primary" />
                        )}
                        {notificationItem.type === "consent_request" && (
                          <RequestIcon color="warning" />
                        )}
                        {notificationItem.type === "consent_approved" && (
                          <CheckIcon color="success" />
                        )}
                        {notificationItem.type === "consent_denied" && (
                          <CloseIcon color="error" />
                        )}
                        {notificationItem.type === "access_revoked" && (
                          <CloseIcon color="error" />
                        )}
                        {notificationItem.type === "context_expired" && (
                          <CloseIcon color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={notificationItem.title}
                        secondary={
                          <Box component="div">
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 0.5 }}
                              component="div"
                            >
                              {notificationItem.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="div"
                            >
                              {new Date(notificationItem.created_at).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                    {notificationIndex < (Array.isArray(notifications) ? Math.min(notifications.length, 10) : 0) - 1 && (
                      <Divider />
                    )}
                  </div>
                ))}
              </List>
            )}
          </Paper>
        </Popover>
      </Container>
    </Box>
  );
}
