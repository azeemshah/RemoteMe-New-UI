import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";

export default function useAdminSignupRequests() {
  const [invitations, setInvitations] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch a page of signup‑requests (only those still in "request" status)
  const fetchRequests = async (page = 1, query = "") => {
    setLoadingRequests(true);
    try {
      const res = await axiosInstance.get(
        `/admin/signup-requests?page=${page}&limit=${limit}&search=${encodeURIComponent(
          query
        )}`
      );
      if (res.status === 200) {
        const reqs = res.data.invitations.filter(
          (inv) => inv.status === "request"
        );
        setInvitations(reqs);
        setTotalPages(res.data.totalPages / limit);
      }
    } catch (err) {
      console.error("Error fetching signup requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Debounced search input handler
  const debouncedSearch = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      fetchRequests(1, q);
    }, 500),
    [limit]
  );

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchTerm(q);
    debouncedSearch(q);
  };

  // Approve (send invite) — remove the row immediately, then re-fetch for counts
  const approveRequest = async (id) => {
    setApprovingId(id);
    setSuccessMessage(""); // clear any previous message

    try {
      const res = await axiosInstance.patch(
        `/admin/signup-requests/${id}/approve`
      );
      if (res.status === 200) {
        // 1) display server message
        setSuccessMessage(res.data.message);

        // 2) optimistically remove the approved invitation from UI
        setInvitations((inv) => inv.filter((item) => item._id !== id));

        // 3) re-fetch current page in background to keep totalPages in sync
        await fetchRequests(currentPage, searchTerm);
      }
    } catch (err) {
      console.error("Error approving signup request:", err);
    } finally {
      setApprovingId(null);
    }
  };

  const clearSuccessMessage = () => {
    setSuccessMessage("");
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchRequests(page, searchTerm);
  };

  // Initial load and refetch when `limit` changes
  useEffect(() => {
    fetchRequests(currentPage, searchTerm);
  }, [limit]);

  return {
    invitations,
    loadingRequests,
    approvingId,
    successMessage,
    searchTerm,
    limit,
    currentPage,
    totalPages,
    handleSearch,
    setLimit,
    handlePageChange,
    approveRequest,
    clearSuccessMessage,
  };
}
