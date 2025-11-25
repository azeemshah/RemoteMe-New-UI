import { useState, useEffect } from "react";
import axiosInstance from "../services/axiosService";

export default function useAdminPayments(initialPage = 1, initialLimit = 10) {
  const [listLoading, setListLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [listError, setListError] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [organizations, setOrganizations] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [payments, setPayments] = useState([]);

  const fetchPayments = async (page = 1) => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await axiosInstance.get("/admin/payments", {
        params: { page, limit, status: statusFilter, organization },
      });

      setPayments(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setListError("Failed to load invoices");
    } finally {
      setListLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await axiosInstance.get("/admin/organizations/list");
      if (res.status === 200) {
        setOrganizations(res.data);
      }
    } catch (err) {
      setListError("Failed to load organizations");
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [limit, statusFilter, organization]);

  return {
    fetchPayments,
    listLoading,
    page,
    setPage,
    limit,
    setLimit,
    listError,
    totalPages,
    statusFilter,
    setStatusFilter,
    organization,
    setOrganization,
    payments,
    organizations,
    fetchOrganizations,
  };
}
