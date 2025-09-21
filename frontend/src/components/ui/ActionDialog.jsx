import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';






const ActionDialog = ({
  open,
  onClose,
  title,
  children,
  actions = [],
  maxWidth = 'sm',
  fullWidth = true,
  showCloseButton = true,
  disableBackdropClick = false,
  disableEscapeKeyDown = false
}) => {
  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby="action-dialog-title"
    >
      <DialogTitle id="action-dialog-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {children}
      </DialogContent>

      {Array.isArray(actions) && actions.length > 0 && (
        <DialogActions sx={{ p: 2, gap: 1 }}>
          {Array.isArray(actions) && actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              color={action.color || 'primary'}
              variant={action.variant || 'contained'}
              disabled={action.disabled}
              startIcon={action.icon}
              size={action.size || 'medium'}
            >
              {action.label}
            </Button>
          ))}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ActionDialog;