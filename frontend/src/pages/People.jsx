import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  TextField,
  InputAdornment,
  Grid,
  Paper,
  Chip,
  IconButton,
  Badge,
  InputBase,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Notifications as NotificationsIcon,
  AccountCircle as ProfileIcon,
  Business as BusinessIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import LogoutButton from "../components/auth/LogoutButton";
import CompanyProfileEditDialog from "../components/profile/CompanyProfileEditDialog";
import api from "../api";


export default function People() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  

  const [profileData, setProfileData] = useState(null);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  

  const [companyProfileEditOpen, setCompanyProfileEditOpen] = useState(false);


  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        const profileResponse = await api.get("profile/");
        setProfileData(profileResponse.data);
        
        const notificationsResponse = await api.get("notifications/");
        const notificationsData = notificationsResponse.data?.data || notificationsResponse.data;
        const unread = Array.isArray(notificationsData) ? notificationsData.filter(n => !n.read).length : 0;
        setUnreadNotifications(unread);
      } catch (err) {
        console.error('Error loading header data:', err);
      }
    };
    
    loadHeaderData();
  }, []);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || params.get('search');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [location.search]);

  const performSearch = async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`search/users/?q=${encodeURIComponent(query.trim())}`);
      const extractedData = response.data?.data || response.data;
      setSearchResults(Array.isArray(extractedData) ? extractedData : []);
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {

      navigate(`/people?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch(searchQuery.trim());
    }
  };


  const handleHeaderSearchChange = (e) => setHeaderSearchQuery(e.target.value);
  const handleHeaderSearchKeyPress = (e) => {
    if (e.key === 'Enter') handleHeaderSearchSubmit();
  };
  const handleHeaderSearchSubmit = () => {
    if (headerSearchQuery.trim()) {
      navigate(`/people?search=${encodeURIComponent(headerSearchQuery.trim())}`);
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

  const handleProfileClick = (profile) => {

    navigate(`/profile/${profile.id}`);
  };


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
              Find People
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
                  value={headerSearchQuery}
                  onChange={handleHeaderSearchChange}
                  onKeyPress={handleHeaderSearchKeyPress}
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
                onClick={handleHeaderSearchSubmit}
                disabled={!headerSearchQuery.trim()}
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

      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 }, pb: 6 }}>
        {}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              placeholder="Search for people by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setHasSearched(false);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!searchQuery.trim() || loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </Paper>

        {}
        {hasSearched && (
          <Box>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Search Results for "{searchQuery}" ({Array.isArray(searchResults) ? searchResults.length : 0} found)
            </Typography>

            {(!Array.isArray(searchResults) || searchResults.length === 0) && !loading ? (
              <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No public profiles found matching your search.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {Array.isArray(searchResults) && searchResults.map((profile) => (
                  <Grid item xs={12} sm={6} md={4} key={profile.id}>
                    <Card 
                      elevation={2}
                      sx={{
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        }
                      }}
                      onClick={() => handleProfileClick(profile)}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar
                          src={profile.profile_picture}
                          sx={{ 
                            width: 80, 
                            height: 80, 
                            mx: 'auto', 
                            mb: 2,
                            fontSize: '2rem'
                          }}
                        >
                          {profile.display_name.charAt(0)}
                        </Avatar>
                        <Typography variant="h6" gutterBottom>
                          {profile.display_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {profile.email}
                        </Typography>
                        <Chip 
                          label={profile.role} 
                          size="small" 
                          color={profile.role === 'individual' ? 'primary' : 'secondary'}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

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