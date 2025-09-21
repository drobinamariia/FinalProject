import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  AppBar,
  Toolbar,
  Paper,
  Grid,
  Chip,
  Divider,
  IconButton,
  Badge,
  InputBase,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import LogoutButton from "../components/auth/LogoutButton";
import CompanyProfileEditDialog from "../components/profile/CompanyProfileEditDialog";
import api from "../api";


export default function PublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const [profileData, setProfileData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  

  const [companyProfileEditOpen, setCompanyProfileEditOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        

        const profileResponse = await api.get(`profile/public/${userId}/`);
        const extractedProfile = profileResponse.data?.data || profileResponse.data;
        setProfile(extractedProfile);
        

        const currentUserResponse = await api.get("profile/");
        const extractedCurrentUser = currentUserResponse.data?.data || currentUserResponse.data;
        setProfileData(extractedCurrentUser);
        

        const notificationsResponse = await api.get("notifications/");
        const notificationsData = notificationsResponse.data?.data || notificationsResponse.data;
        const unread = Array.isArray(notificationsData) ? notificationsData.filter(n => !n.read).length : 0;
        setUnreadNotifications(unread);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadData();
    }
  }, [userId]);


  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/people?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const openProfileEdit = () => {
    navigate("/dashboard");
  };
  const handleNotificationClick = () => {
    navigate('/dashboard');
  };

  const handleCompanyProfileEditSave = async () => {

    const profileResponse = await api.get("profile/");
    setProfileData(profileResponse.data);
    setCompanyProfileEditOpen(false);
  };

  const handleCompanyProfileEditClose = () => {
    setCompanyProfileEditOpen(false);
  };

  const handleRedeemContext = async (contextId, contextData) => {
    try {
      const response = await api.post('redeem-by-id/', { context_id: contextId });


      const redeemData = response.data.data || response.data;


      const profileResponse = await api.get('profile/');
      const profileData = profileResponse.data.data || profileResponse.data;
      const userRole = profileData.role;

      if (userRole === 'individual') {

        const jsonData = {
          name: `${redeemData.given} ${redeemData.family}`,
          context: redeemData.context_label || contextData.label,
          code: 'N/A',
          redeemed_at: new Date().toISOString(),
          id: contextId
        };

        const dataStr = JSON.stringify(jsonData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${redeemData.given}_${redeemData.family}_${contextData.label.replace(/\s+/g, '_')}.json`;
        link.click();
        URL.revokeObjectURL(url);

        alert(`Successfully redeemed and downloaded: ${redeemData.given} ${redeemData.family}`);
      } else {

        alert(`Successfully redeemed: ${redeemData.given} ${redeemData.family}. Check your dashboard to view the contact.`);
      }
    } catch (err) {
      console.error('Error redeeming context:', err);
      alert(err.response?.data?.error || 'Failed to redeem context');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button onClick={() => navigate('/dashboard')} variant="contained">
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Box>
      {}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 }, justifyContent: 'space-between' }}>
          {}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
              title="Back to Dashboard"
            >
              <ArrowBackIcon />
            </IconButton>
            <PersonIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ mr: 3 }}>
              Public Profile
            </Typography>

            {}
            <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: 400 }}>
              <Box sx={{
                position: 'relative',
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                width: 250,
                mr: 1
              }}>
                <Box sx={{
                  padding: '0 16px',
                  height: '100%',
                  position: 'absolute',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <SearchIcon />
                </Box>
                <InputBase
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                  sx={{
                    color: 'inherit',
                    width: '100%',
                    '& .MuiInputBase-input': {
                      padding: '8px 8px 8px 48px',
                      transition: 'width 0.3s'
                    }
                  }}
                />
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={handleSearchSubmit}
                disabled={!searchQuery.trim()}
                sx={{ 
                  minWidth: 'auto',
                  px: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                  '&.Mui-disabled': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                Go
              </Button>
            </Box>
          </Box>

          {}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {}
            {profileData?.is_public_profile && (
              <IconButton
                color="inherit"
                onClick={() => navigate(`/profile/${profileData?.id}`)}
                sx={{ mr: 1 }}
                title="View My Public Profile"
              >
                <ViewIcon />
              </IconButton>
            )}

            {}
            <IconButton
              color="inherit"
              onClick={openProfileEdit}
              sx={{ mr: 1 }}
              title={profileData?.role === 'company' ? 'Edit Company Profile' : 'Edit Profile'}
            >
              {profileData?.role === 'company' ? <BusinessIcon /> : <ProfileIcon />}
            </IconButton>

            {}
            <IconButton
              color="inherit"
              onClick={handleNotificationClick}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <LogoutButton />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ px: { xs: 2, md: 4 }, pb: 6 }}>
        {}
        <Paper elevation={3} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
          <Avatar
            src={profile.profile_picture}
            sx={{ 
              width: 120, 
              height: 120, 
              mx: 'auto', 
              mb: 3,
              fontSize: '3rem'
            }}
          >
            {profile.display_name?.charAt(0) || profile.given?.charAt(0) || profile.email?.charAt(0) || 'U'}
          </Avatar>
          
          <Typography variant="h3" fontWeight={600} gutterBottom>
            {profile.display_name || `${profile.given || ''} ${profile.family || ''}`.trim() || profile.email || 'Unknown User'}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {profile.email}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
            <Chip 
              label={profile.role || 'user'}
              color={(profile.role || 'individual') === 'individual' ? 'primary' : 'secondary'}
              icon={(profile.role || 'individual') === 'individual' ? <PersonIcon /> : <BusinessIcon />}
            />
            <Chip 
              label="Public Profile" 
              color="success"
              variant="outlined"
            />
          </Box>
        </Paper>

        {}
        {profile.bio && profile.bio.trim() && (
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                About
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {profile.bio || ''}
              </Typography>
            </CardContent>
          </Card>
        )}

        {}
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon color="primary" />
              Public Names ({profile.public_contexts?.length || 0})
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {Array.isArray(profile.public_contexts) && profile.public_contexts.length > 0 ? (
              <Grid container spacing={3}>
                {Array.isArray(profile.public_contexts) && profile.public_contexts.map((context) => (
                  <Grid item xs={12} sm={6} key={context.id}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        transition: 'all 0.2s',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {}
                      <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography variant="h5" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                          {context.given} {context.family}
                        </Typography>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<ViewIcon />}
                          onClick={() => handleRedeemContext(context.id, context)}
                          sx={{ 
                            minWidth: 140,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            py: 1
                          }}
                        >
                          Redeem Name
                        </Button>
                      </Box>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      {}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Context:</strong> {context.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>ID:</strong> {context.id}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  bgcolor: 'grey.50',
                  border: '1px dashed',
                  borderColor: 'grey.300'
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  No public names available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This user hasn't shared any public contact information yet.
                </Typography>
              </Paper>
            )}
          </CardContent>
        </Card>
      </Container>

      {}
      <CompanyProfileEditDialog
        open={companyProfileEditOpen}
        onClose={handleCompanyProfileEditClose}
        onSave={handleCompanyProfileEditSave}
      />
    </Box>
  );
}