import { useState, useCallback } from 'react';
import api from '../api';
import { useNotifications } from './useNotifications';
import { extractResponseData, extractArrayData } from '../utils/apiResponseHandler';


export const useDashboardData = () => {
  const [profileData, setProfileData] = useState(null);
  const {
    loadNotifications,
    ...notificationMethods
  } = useNotifications();

  const loadProfileData = useCallback(async (forceRefresh = false) => {
    try {
      const url = forceRefresh ? `profile/?t=${Date.now()}` : "profile/";
      const response = await api.get(url);
      const extractedData = extractResponseData(response);
      setProfileData(extractedData);
    } catch (error) {
      setProfileData(null);
    }
  }, []);

  const loadHeaderData = useCallback(async (forceRefresh = false) => {
    await Promise.all([
      loadProfileData(forceRefresh),
      loadNotifications()
    ]);
  }, [loadProfileData, loadNotifications]);


  const checkExpiredContexts = useCallback(async () => {
    try {
      const response = await api.post("check-expired-contexts/");
      if (response.data.contexts_processed) {
        await loadHeaderData();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [loadHeaderData]);

  const forceRefreshProfile = useCallback(async () => {
    await loadHeaderData(true);
  }, [loadHeaderData]);

  return {
    profileData,
    loadProfileData,
    loadHeaderData,
    forceRefreshProfile,
    checkExpiredContexts,
    loadNotifications,
    ...notificationMethods
  };
};


export const useIndividualData = () => {
  const [contexts, setContexts] = useState([]);
  const [archivedContexts, setArchivedContexts] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [consentRequests, setConsentRequests] = useState([]);

  const {
    loadHeaderData,
    forceRefreshProfile,
    checkExpiredContexts,
    ...dashboardMethods
  } = useDashboardData();

  const loadAllData = useCallback(async () => {
    try {
      const contextsResponse = await api.get("contexts/");
      const contextsData = extractArrayData(contextsResponse);
      setContexts(contextsData);

      try {
        const redemptionsResponse = await api.get("redemptions/");
        const redemptionsData = extractArrayData(redemptionsResponse);
        setRedemptions(redemptionsData);
      } catch (error) {
        setRedemptions([]);
      }

      try {
        const consentResponse = await api.get("consent-requests/");
        const consentData = extractArrayData(consentResponse);
        setConsentRequests(consentData);
      } catch (error) {
        setConsentRequests([]);
      }

      try {
        const archivedResponse = await api.get("contexts/archived/");
        const archivedData = extractArrayData(archivedResponse);
        setArchivedContexts(archivedData);
      } catch (error) {
        setArchivedContexts([]);
      }

      await loadHeaderData();
      return contextsData;
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setContexts([]);
      return [];
    }
  }, [loadHeaderData]);

  const refreshWithExpiredCheck = useCallback(async () => {
    await checkExpiredContexts();
    await loadAllData();
  }, [checkExpiredContexts, loadAllData]);


  const refreshTabData = useCallback(async (tabIndex) => {
    await checkExpiredContexts();

    switch (tabIndex) {
      case 1:
        try {
          const redemptionsResponse = await api.get("redemptions/");
          const redemptionsData = extractArrayData(redemptionsResponse);
          setRedemptions(redemptionsData);
        } catch (error) {
          setRedemptions([]);
        }
        break;
      case 2:
        try {
          const consentResponse = await api.get("consent-requests/");
          const consentData = extractArrayData(consentResponse);
          setConsentRequests(consentData);
        } catch (error) {
          setConsentRequests([]);
        }
        break;
      case 3:
        try {
          const archivedResponse = await api.get("contexts/archived/");
          const archivedData = extractArrayData(archivedResponse);
          setArchivedContexts(archivedData);
        } catch (error) {
          setArchivedContexts([]);
        }
        break;
      default:
        break;
    }
  }, [checkExpiredContexts]);

  return {
    contexts,
    setContexts,
    archivedContexts,
    setArchivedContexts,
    redemptions,
    setRedemptions,
    consentRequests,
    setConsentRequests,
    loadAllData,
    refreshWithExpiredCheck,
    refreshTabData,
    forceRefreshProfile,
    ...dashboardMethods
  };
};


export const useCompanyData = () => {
  const [redemptions, setRedemptions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const {
    loadHeaderData,
    forceRefreshProfile,
    checkExpiredContexts,
    ...dashboardMethods
  } = useDashboardData();

  const loadRedemptions = useCallback(async () => {
    try {
      const response = await api.get("company-redemptions/");
      const redemptionsData = extractArrayData(response);
      setRedemptions(redemptionsData);
    } catch (error) {
      setRedemptions([]);
    }
  }, []);

  const loadPendingRequests = useCallback(async () => {
    try {
      const response = await api.get("company-pending-requests/");
      const pendingData = extractArrayData(response);
      setPendingRequests(pendingData);
    } catch (error) {
      setPendingRequests([]);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadRedemptions(),
      loadPendingRequests(),
      loadHeaderData()
    ]);
  }, [loadRedemptions, loadPendingRequests, loadHeaderData]);

  const refreshWithExpiredCheck = useCallback(async () => {
    await checkExpiredContexts();
    await loadAllData();
  }, [checkExpiredContexts, loadAllData]);

  return {
    redemptions,
    setRedemptions,
    pendingRequests,
    setPendingRequests,
    loadRedemptions,
    loadPendingRequests,
    loadAllData,
    refreshWithExpiredCheck,
    forceRefreshProfile,
    ...dashboardMethods
  };
};