import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import axiosInstance from "../services/axiosService";
import { formatDisplayDate } from "../utils/dateUtils";
import { API_URL } from "../config/index";

const useEmpDashboard = () => {
  const { user } = useAuth();
  const [payData, setPayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user details from auth
  const userName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name || user?.last_name || "User";
  const userRole = user?.role || "Employee";
  const organizationName = user?.organization?.name || "Organization";
  const userAvatar = user?.avatar ? `${API_URL}${user.avatar}` : "/user.png";

  // Fetch employee dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get("/employee/dashboard");

        if (response.data) {
          setPayData(response.data);
        } else {
          // Set default empty data when API returns no data
          setPayData({
            total_amount: 0,
            total_hours: 0,
            hourly_rate: 0,
            gross_amount: 0,
            total_additions: 0,
            total_deductions: 0,
            status: "pending",
            cycle_start: new Date().toISOString(),
            cycle_end: new Date().toISOString(),
            cycle: { title: "Current Cycle" },
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // Set default empty data when API call fails
        setPayData({
          total_amount: 0,
          total_hours: 0,
          hourly_rate: 0,
          gross_amount: 0,
          total_additions: 0,
          total_deductions: 0,
          status: "pending",
          cycle_start: new Date().toISOString(),
          cycle_end: new Date().toISOString(),
          cycle: { title: "Current Cycle" },
        });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Build chart data based on actual pay data
  const chartData =
    payData && typeof payData === "object"
      ? {
          labels: ["Take Home", "Additions", "Deductions"],
          datasets: [
            {
              data: [
                payData.invoice?.payable_amount || 0,
                payData.invoice?.total_additions || 0,
                payData.invoice?.total_deductions || 0,
              ],
              backgroundColor: ["#00b956", "#5093fe", "#dc3545"],
              borderWidth: 2,
              borderColor: "#ffffff",
              hoverBorderWidth: 3,
            },
          ],
        }
      : {
          labels: ["Take Home", "Additions", "Deductions"],
          datasets: [
            {
              data: [0, 0, 0],
              backgroundColor: ["#00b956", "#5093fe", "#dc3545"],
              borderWidth: 2,
              borderColor: "#ffffff",
              hoverBorderWidth: 3,
            },
          ],
        };

  // Format date for display
  const formatDate = (dateString) => {
    return formatDisplayDate(dateString);
  };

  // Get cycle month and year
  const getCycleDisplay = () => {
    if (!payData?.cycle?.title) return "";
    return payData.cycle.title;
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-warning text-white";
      case "approved":
        return "bg-success text-white";
      case "submitted":
        return "bg-info text-white";
      case "paid":
        return "bg-primary text-white";
      case "flagged":
        return "bg-danger text-white";
      case "declined":
        return "bg-danger text-white";
      case "change requested":
        return "bg-danger text-white";
      case "change-requested":
        return "bg-danger text-white";
      case "created":
        return "bg-info bg-opacity-75 text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  return {
    // User data from auth
    userName,
    userRole,
    organizationName,
    userAvatar,

    // Pay data from API
    payData,
    loading,
    error,

    // Chart data
    chartData,

    // Utility functions
    formatDate,
    getCycleDisplay,
    getStatusBadgeColor,
  };
};

export default useEmpDashboard;
