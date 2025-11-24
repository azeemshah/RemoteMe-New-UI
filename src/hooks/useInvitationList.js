import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";

export default function useInvitationList() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState(""); // success
  const [errorMessage, setErrorMessage] = useState(""); // error
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchInvitations = async (p = 1, q = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/all-invitations?page=${p}&limit=${limit}&search=${encodeURIComponent(
          q
        )}`
      );
      if (res.status === 200) {
        setInvitations(res.data.invitations);
        setTotalPages(Math.ceil(res.data.total / limit));
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((q) => {
      setPage(1);
      fetchInvitations(1, q);
    }, 500),
    [limit]
  );

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchTerm(q);
    debouncedSearch(q);
  };

  const deleteInvitation = async (id) => {
    setDeleteId(id);
    setMessage("");
    setErrorMessage("");

    try {
      const res = await axiosInstance.delete(
        `/admin/organization-invitations/${id}`
      );
      if (res.status === 200) {
        setMessage(res.data.message || "Invitation deleted successfully.");
        await fetchInvitations(page, searchTerm);
      } else if (res.status === 400) {
        setErrorMessage(res.data.message || "Failed to delete invitation.");
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.message || err.message || "Something went wrong.";
      setErrorMessage(serverMsg);
    } finally {
      setDeleteId(null);
    }
  };

  const resendInvitation = async (id) => {
    setActionId(id);
    setMessage("");
    setErrorMessage("");
    try {
      const res = await axiosInstance.patch(
        `/admin/signup-requests/${id}/approve`
      );
      if (res.status === 200) {
        setMessage(res.data.message || "Invitation resent successfully.");
        await fetchInvitations(page, searchTerm);
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.message || err.message || "Something went wrong.";
      setErrorMessage(serverMsg);
    } finally {
      setActionId(null);
    }
  };

  const clearMessage = () => setMessage("");
  const clearErrorMessage = () => setErrorMessage("");

  const handlePageChange = (p) => {
    setPage(p);
    fetchInvitations(p, searchTerm);
  };

  useEffect(() => {
    fetchInvitations(page, searchTerm);
  }, [limit]);

  return {
    invitations,
    loading,
    actionId,
    message,
    errorMessage,
    searchTerm,
    limit,
    page,
    totalPages,
    handleSearch,
    setLimit,
    handlePageChange,
    resendInvitation,
    clearMessage,
    clearErrorMessage,
    deleteInvitation,
    deleteId,
  };
}
