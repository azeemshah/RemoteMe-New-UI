import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import axiosInstance from "../services/axiosService";

const useAdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get("/admin/dashboard");
        if (response.data) {
          setDashboardData(response.data);
        } else {
          // Set default empty data instead of error
          setDashboardData({
            total_organizations: 0,
            total_users: 0,
            total_signup_requests: 0,
            pending_invitations: 0,
          });
        }
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
        setError("Failed to fetch dashboard data");
        // Set default empty data on error
        setDashboardData({
          total_organizations: 0,
          total_users: 0,
          total_signup_requests: 0,
          pending_invitations: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const refreshDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/admin/dashboard");
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error("Error refreshing admin dashboard data:", err);
      setError("Failed to refresh dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    loading,
    error,
    refreshDashboard,
  };
};

export default useAdminDashboard;
