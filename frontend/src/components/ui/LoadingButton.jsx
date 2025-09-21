import React from 'react';
import { Button, CircularProgress } from '@mui/material';






const LoadingButton = ({
  loading = false,
  children,
  disabled,
  loadingText = "Loading...",
  size = "medium",
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      size={size}
      startIcon={
        loading ? (
          <CircularProgress
            size={size === "small" ? 16 : size === "large" ? 24 : 20}
            color="inherit"
          />
        ) : (
          props.startIcon
        )
      }
    >
      {loading ? loadingText : children}
    </Button>
  );
};

export default LoadingButton;