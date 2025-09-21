import {
  Box,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Code as CodeIcon,
  NotificationImportant as RequestIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';







export default function NotificationPopover({
  open,
  anchorEl,
  onClose,
  notifications = [],
  onMarkAsRead
}) {
  


  const getNotificationIcon = (type) => {
    switch (type) {
      case 'redemption':
        return <CodeIcon color="primary" />;
      case 'consent_request':
        return <RequestIcon color="warning" />;
      case 'consent_approved':
        return <CheckIcon color="success" />;
      case 'access_revoked':
      case 'consent_denied':
      case 'context_expired':
        return <CloseIcon color="error" />;
      default:
        return <CodeIcon color="primary" />;
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box sx={{ width: 400, maxHeight: 500, overflow: 'auto' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>

        {!Array.isArray(notifications) || notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {Array.isArray(notifications) && notifications.slice(0, 10).map((notification, index) => (
              <div key={notification.id}>
                <ListItem
                  sx={{
                    backgroundColor: notification.read
                      ? 'transparent'
                      : 'action.hover',
                    cursor: 'pointer',
                  }}
                  onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box component="div">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 0.5 }}
                          component="div"
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                        >
                          {new Date(notification.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < Math.min(Array.isArray(notifications) ? notifications.length : 0, 10) - 1 && <Divider />}
              </div>
            ))}
          </List>
        )}
      </Box>
    </Popover>
  );
}