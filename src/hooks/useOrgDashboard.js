import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import axiosInstance from "../services/axiosService";

const useOrgDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Fetch organization dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await axiosInstance.get("/organization/dashboard");
        if (response.data) {
          setDashboardData(response.data);
        } else {
          // Set default empty data instead of error
          setDashboardData({
            employeeCount: 0,
            submitted_timesheets: 0,
            submitted_invoices: 0,
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // Set default empty data instead of error
        setDashboardData({
          employeeCount: 0,
          submitted_timesheets: 0,
          submitted_invoices: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Fetch employees with search and pagination
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user?.id) return;

      try {
        const params = {
          page: currentPage,
          limit: recordsPerPage,
          search: searchTerm,
        };

        const response = await axiosInstance.get(
          "/organization/dashboard/recent-employees",
          { params }
        );

        if (response.data) {
          // Handle direct array response or nested structure
          if (Array.isArray(response.data)) {
            setEmployees(response.data);
            setTotalPages(1);
            setTotalRecords(response.data.length);
          } else {
            setEmployees(response.data.employees || []);
            setTotalPages(response.data.totalPages || 1);
            setTotalRecords(response.data.total || 0);
          }
        } else {
          setEmployees([]);
          setTotalPages(1);
          setTotalRecords(0);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setEmployees([]); // Set empty array on error
        setTotalPages(1);
        setTotalRecords(0);
      }
    };

    fetchEmployees();
  }, [user?.id, currentPage, searchTerm, recordsPerPage]);

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-warning text-white";
      case "active":
        return "bg-success text-white";
      case "inactive":
        return "bg-secondary text-white";
      case "suspended":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  return {
    // Dashboard data
    dashboardData,
    employees,
    loading,
    error,

    // Search and pagination
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    totalRecords,
    recordsPerPage,
    setRecordsPerPage,

    // Utility functions
    getStatusBadgeColor,
  };
};

export default useOrgDashboard;
