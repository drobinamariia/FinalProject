import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box } from '@mui/material';
import { useState, useEffect } from "react";
import RequireAuth from "./routes/RequireAuth";
import api from "./api";
import { extractResponseData } from "./utils/apiResponseHandler";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Individual from "./pages/Individual";
import Company from "./pages/Company";
import CreateContextAdvanced from "./pages/CreateContextAdvanced";
import PersonalDetails from "./pages/PersonalDetails";
import CompanyDetails from "./pages/CompanyDetails";
import People from "./pages/People";
import PublicProfile from "./pages/PublicProfile";

function DashboardRouter() {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      try {
        const response = await api.get("profile/");
        const profileData = extractResponseData(response);
        setUserProfile(profileData);
      } catch (error) {
        console.error("Error checking profile:", error);
        if (error.response?.status === 401) {

          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("role");
          window.location.href = '/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkUserProfile();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </Box>
    );
  }

  const userRole = localStorage.getItem("role");


  if (userRole === "individual" && !userProfile?.profile_completed) {
    return <Navigate to="/personal-details" replace />;
  }
  if (userRole === "company" && !userProfile?.profile_completed) {
    return <Navigate to="/company-details" replace />;
  }

  if (userRole === "company") return <Company />;
  return <Individual />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh' }}>
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<DashboardRouter />} />
              <Route path="/company" element={<DashboardRouter />} />
              <Route path="/create-context" element={<CreateContextAdvanced />} />
              <Route path="/personal-details" element={<PersonalDetails />} />
              <Route path="/company-details" element={<CompanyDetails />} />
              <Route path="/people" element={<People />} />
              <Route path="/profile/:userId" element={<PublicProfile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </Box>
    </BrowserRouter>
  );
}
