import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../services/axiosService";
import { debounce, getOrganizationsDD } from "../helpers";

const useUsers = () => {
  const [searchParams] = useSearchParams();
  const orgID = searchParams.get("orgID") || "";

  const defaultOrg = useMemo(
    () => ({ value: "", label: "All Organizations" }),
    []
  );

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [orgList, setOrgList] = useState([]);
  const [orgId, setOrgID] = useState(orgID);
  const [selectedOrg, setSelectedOrg] = useState(defaultOrg);
  const [formData, setFormData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    contact_number: "",
    linkedin_profile: "",
    cv: null,
    cvUrl: "",
  });

  const [showForm, setShowForm] = useState(true);

  const cvRef = useRef(null);

  // Fetch list, appending orgID if present
  const getUsers = async (page, query = "") => {
    setLoading(true);
    try {
      let url = `/admin/users?page=${page}&limit=${limit}`;
      if (query) url += `&search=${encodeURIComponent(query)}`;
      if (orgId) url += `&orgID=${encodeURIComponent(orgId)}`;

      const res = await axiosInstance.get(url);
      if (res.status === 200) {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
      }
    } catch (e) {
      console.error("Error fetching users:", e);
      setErrors((prev) => ({ ...prev, fetch: e }));
    } finally {
      setLoading(false);
    }
  };

  const getOrganizationsList = async () => {
    getOrganizationsDD(setOrgList);
  };

  // Fetch single user for modal view
  const getUserById = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/users/${id}`);
      if (res.status === 200) {
        setSelectedUser(res.data);
        setShowModal(true);
      }
    } catch (e) {
      console.error("Error loading user details:", e);
      setErrors((prev) => ({ ...prev, detail: e }));
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Debounced search so we don't hammer the API on every keystroke
  const debouncedSearch = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      getUsers(1, q);
    }, 500),
    [limit, orgID]
  );

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchTerm(q);
    debouncedSearch(q);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    getUsers(page, searchTerm);
  };

  const handleFormChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: e.target.files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addNew = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("first_name", formData.first_name);
      formDataToSend.append("last_name", formData.last_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("contact_number", formData.contact_number);
      formDataToSend.append("linkedin_profile", formData.linkedin_profile);
      formDataToSend.append("cv", formData.cv);

      const res = await axiosInstance.post("/admin/users", formDataToSend, {
        headers: { "Content-Type": undefined },
      });

      if (res.status === 201) {
        setSuccessMessage("Employee added successfully.");
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          contact_number: "",
          linkedin_profile: "",
          cv: null,
          cvUrl: "",
        });
        cvRef.current.value = "";
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else {
        setErrorMessage("Error adding employee.");
      }
    } catch (e) {
      setErrorMessage("Something went wrong. Please try again.");
      console.error("Error adding employee:", e);
    } finally {
      setLoading(false);
    }
  };

  const getById = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/users/details/${id}`);
      if (res.status === 200) {
        const {
          _id,
          first_name,
          last_name,
          email,
          contact_number,
          linkedin_profile,
          cvUrl,
        } = res.data;
        setFormData({
          id: _id,
          first_name,
          last_name,
          email,
          contact_number,
          linkedin_profile: linkedin_profile || "",
          cvUrl,
        });
      } else {
        setErrorMessage("Error fetching user details.");
        setShowForm(false);
      }
    } catch (e) {
      setErrorMessage("Something went wrong. Please try again.");
      console.error("Error fetching user:", e);
    } finally {
      setLoading(false);
    }
  };

  const edit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");

    const formDataToSend = new FormData();
    formDataToSend.append("first_name", formData.first_name);
    formDataToSend.append("last_name", formData.last_name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("contact_number", formData.contact_number);
    formDataToSend.append("linkedin_profile", formData.linkedin_profile);
    if (formData.cv) {
      formDataToSend.append("cv", formData.cv);
    }

    try {
      const res = await axiosInstance.put(
        `/admin/users/edit/${formData.id}`,
        formDataToSend,
        {
          headers: { "Content-Type": undefined },
        }
      );

      if (res.status === 200) {
        setSuccessMessage("User updated successfully.");
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else {
        setErrorMessage("Error updating user.");
      }
    } catch (e) {
      setErrorMessage("Something went wrong. Please try again.");
      console.error("Error updating user:", e);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever limit or orgID changes
  useEffect(() => {
    setCurrentPage(1);
    getUsers(1, searchTerm);
  }, [limit, orgId]);

  return {
    cvRef,
    users,
    loading,
    currentPage,
    totalPages,
    searchTerm,
    handleSearch,
    limit,
    setLimit,
    handlePageChange,
    selectedUser,
    showModal,
    getUserById,
    closeModal,
    errors,
    getOrganizationsList,
    orgList,
    setOrgID,
    orgId,
    addNew,
    formData,
    setFormData,
    handleFormChange,
    successMessage,
    errorMessage,
    getById,
    showForm,
    edit,
    selectedOrg,
    setSelectedOrg,
  };
};

export default useUsers;
