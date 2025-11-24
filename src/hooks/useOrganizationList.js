import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";

const useOrganizationList = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attaching, setAttaching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [errors, setErrors] = useState({});
  const [attachError, setAttachError] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [removeId, setRemoveId] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const [attachedDocuments, setAttachedDocuments] = useState([]);

  // detail view state
  const [selectedOrg, setSelectedOrg] = useState(null);

  // Fetch paginated list
  const getOrganizations = async (pageNo = 1, query = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/organizations?page=${pageNo}&search=${encodeURIComponent(
          query
        )}&account_status=${accountFilter}&limit=${limit}`
      );
      if (res.status === 200) {
        setOrganizations(res.data.organizations);
        setTotalPages(res.data.totalPages);
      } else {
        setErrors((prev) => ({
          ...prev,
          fetch: res.data?.message || `Error ${res.status}`,
        }));
      }
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        fetch: e.message || "Network error",
      }));
    } finally {
      setLoading(false);
    }
  };

  // Fetch single organization detail
  const getOrgById = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/organizations/${id}`);
      if (res.status === 200) {
        setSelectedOrg(res.data);
        setAttachedDocuments(
          res.data.documents.map((doc) => doc.admin_document_id)
        );
      } else {
        setErrors((prev) => ({
          ...prev,
          fetchDetail: res.data?.message || `Error ${res.status}`,
        }));
      }
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        fetchDetail: e.message || "Network error",
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleAdmindocuments = (e) => {
    const { checked, value } = e.target;
    if (checked) {
      setAttachedDocuments((prev) => [...prev, value]);
    } else {
      setAttachedDocuments((prev) => prev.filter((id) => id !== value));
    }
  };

  const handleAttachDetach = async () => {
    setAttaching(true);
    setAttachError("");
    try {
      const res = await axiosInstance.patch(
        `/admin/organizations/${selectedOrg._id}/attach-documents`,
        {
          documents: attachedDocuments,
        }
      );

      if (res.status === 200) {
        await getOrgById(selectedOrg._id);
      } else if (res.status === 400 || res.status === 404) {
        setAttachError(
          res.response.data?.errors?.documents || "Validation error"
        );
      } else {
        setAttachError(`Something went wrong.`);
      }
    } catch (e) {
      setAttachError("Network error");
    } finally {
      setAttaching(false);
    }
  };

  const changeAccountStatus = async (id, newStatus, comment = "") => {
    setLoading(true);
    try {
      const payload = { status: newStatus };
      if (newStatus === "declined") payload.comment = comment;

      const res = await axiosInstance.put(
        `/admin/organizations/${id}`,
        payload,
        { validateStatus: () => true }
      );

      if (res.status === 200) {
        // Re-fetch detail (so all fields remain intact) and list
        await getOrgById(id);
        await getOrganizations(currentPage, searchTerm);
        return { success: true, message: res.data.message || "" };
      } else {
        const msg = res.data?.message || `Error ${res.status}`;
        return { success: false, message: msg };
      }
    } catch (e) {
      return { success: false, message: e.message || "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // Toggle overall organization active/inactive
  const toggleOrgStatus = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch(`/admin/organizations/${id}`);
      if (res.status === 200) {
        await getOrganizations(currentPage, searchTerm);
      } else {
        setErrors((prev) => ({
          ...prev,
          toggle: res.data?.message || `Error ${res.status}`,
        }));
      }
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        toggle: e.message || "Network error",
      }));
    } finally {
      setLoading(false);
    }
  };

  // Debounced search for list
  const debouncedSearch = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      getOrganizations(1, q);
    }, 500),
    [limit]
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getOrganizations(page, searchTerm);
  };

  const handleRemoveDocument = async (docId) => {
    setRemoveId(docId);
    setShowRemove(true);
  };

  const removeDocument = async (docId) => {
    setRemoving(true);
    setShowRemove(false);
    setRemoveError("");
    try {
      const res = await axiosInstance.delete(
        `/admin/organizations/signed-document/${docId}`
      );

      if (res.status === 200) {
        setAttachedDocuments([]);
        await getOrgById(selectedOrg._id);
      } else if (res.status === 400 || res.status === 404) {
        setRemoveError(res.response?.data?.message);
      } else {
        setRemoveError(`Something went wrong.`);
      }
    } catch (e) {
      setRemoveError("Network error");
    } finally {
      setRemoving(false);
      setRemoveId(null);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    getOrganizations(1, searchTerm);
  }, [limit, accountFilter]);

  return {
    organizations,
    loading,
    currentPage,
    totalPages,
    handlePageChange,
    handleSearch,
    searchTerm,
    limit,
    setLimit,
    toggleOrgStatus,
    selectedOrg,
    getOrgById,
    changeAccountStatus,
    errors,
    accountFilter,
    setAccountFilter,
    attachedDocuments,
    handleAdmindocuments,
    handleAttachDetach,
    attaching,
    handleRemoveDocument,
    attachError,
    removeId,
    setRemoveId,
    removeDocument,
    removing,
    showRemove,
    setShowRemove,
    removeError,
  };
};

export default useOrganizationList;
