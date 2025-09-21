import { useNavigate } from 'react-router-dom';
import { Box, Typography, AppBar, Toolbar, InputBase, Button, IconButton, Badge } from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useSearch } from '../../hooks/useSearch';
import LogoutButton from '../auth/LogoutButton';
import NotificationPopover from './NotificationPopover';


const DashboardHeader = ({
  title,
  icon: HeaderIcon,
  profileData,
  notifications,
  unreadCount,
  notificationAnchor,
  onNotificationClick,
  onNotificationClose,
  onProfileClick,
  onMarkNotificationAsRead
}) => {
  const {
    searchQuery,
    handleSearchChange,
    handleSearchSubmit,
    handleSearchKeyPress
  } = useSearch();

  const navigate = useNavigate();

  return (
    <>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ px: { xs: 2, md: 4 }, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HeaderIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ mr: 3 }}>
              {title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: 500 }}>
              <Box sx={{
                position: 'relative',
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                width: 300,
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

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

            <IconButton
              color="inherit"
              onClick={onProfileClick}
              sx={{ mr: 1 }}
              title="Edit Profile"
            >
              <HeaderIcon />
            </IconButton>

            <IconButton
              color="inherit"
              onClick={onNotificationClick}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <LogoutButton />
          </Box>
        </Toolbar>
      </AppBar>

      <NotificationPopover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={onNotificationClose}
        notifications={notifications}
        onMarkAsRead={onMarkNotificationAsRead}
      />
    </>
  );
};


export default DashboardHeader;