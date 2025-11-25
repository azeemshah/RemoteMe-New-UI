import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";

const useOrgAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    contact_number: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // 1) Load admin list
  const load = async (page = 1, query = "") => {
    setLoading(true);
    setServerError("");
    try {
      const res = await axiosInstance.get(
        `/organization/admins?page=${page}&search=${encodeURIComponent(
          query
        )}&limit=${limit}`
      );
      if (res.status === 200) {
        setAdmins(res.data.admins);
        setTotalPages(res.data.totalPages);
      } else if (res.status == 400) {
        setServerError(
          res.response.data.message ||
            "Failed to load admins. Please try again."
        );
      } else {
        setServerError("Failed to load admins. Please try again.");
      }
    } catch (e) {
      console.error("Failed to load admins", e);
      setServerError("Failed to load admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3) Debounced search
  const debounced = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      load(1, q);
    }, 500),
    [limit]
  );
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    debounced(e.target.value);
  };

  // 4) Page change
  const changePage = (p) => {
    setCurrentPage(p);
    load(p, searchTerm);
  };

  // 5) Toggle active/inactive status
  const toggleStatus = async (id) => {
    console.log("Toggling status for", id);
    setLoading(true);
    setServerError("");
    try {
      await axiosInstance.patch(`/organization/admins/${id}/toggle-status`);
      await load(currentPage, searchTerm);
    } catch (e) {
      console.error("Failed to toggle status", e);
      setServerError("Failed to toggle status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 8) Form change handler
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // 9) Save edits
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setServerError("");
    try {
      const payload = {
        ...formData,
      };

      const res = await axiosInstance.post(`/organization/admins`, payload);

      if (res.status === 400) {
        setErrors(res.response.data.errors || {});
        setServerError(
          res.response.data.message || "Save failed. Please check the form."
        );
      } else if (res.status === 201) {
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          password: "",
          confirm_password: "",
          contact_number: "",
        });
        setSuccessMessage("Admin added successfully.");
      }
    } catch (err) {
      console.error("Save failed", err);
      setServerError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // 10) Initial load & on limit change
  useEffect(() => {
    load(1, "");
  }, [limit]);

  return {
    admins,
    loading,
    currentPage,
    totalPages,
    searchTerm,
    handleSearch,
    limit,
    setLimit,
    changePage,
    toggleStatus,
    formData,
    handleChange,
    serverError,
    successMessage,
    errors,
    save,
    saving,
  };
};

export default useOrgAdmin;
