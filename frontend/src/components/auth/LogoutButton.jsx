import { useNavigate } from "react-router-dom";
import { Button } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

export default function LogoutButton() {
  const nav = useNavigate();
  function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    nav("/login");
  }
  return (
    <Button
      color="inherit"
      onClick={logout}
      startIcon={<LogoutIcon />}
    >
      Logout
    </Button>
  );
}
