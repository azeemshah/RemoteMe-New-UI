import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_ROUTES } from "../config/routes";

const useAdminBenefits = () => {
  const [showModal, setShowModal] = useState(false);
  const [benefitForm, setBenefitForm] = useState({
    id: null,
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch a page of benefits
  const fetchBenefits = async (page = 1, query = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/benefits?page=${page}&limit=${limit}&search=${encodeURIComponent(
          query
        )}`
      );
      if (res.status === 200) {
        setBenefits(res.data.benefits);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching benefits:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      fetchBenefits(1, q);
    }, 500),
    [limit]
  );

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchTerm(q);
    debouncedSearch(q);
  };

  // Initial fetch and when `limit` changes
  useEffect(() => {
    fetchBenefits(currentPage, searchTerm);
  }, [limit]);

  // If editing (id present), load that benefit into form
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/admin/benefits/${id}`);
        if (res.status === 200) {
          setBenefitForm({
            id: res.data._id,
            name: res.data.name,
            description: res.data.description,
          });
          setShowModal(true);
        }
      } catch (err) {
        console.error("Error loading benefit:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Create new benefit
  const createBenefit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await axiosInstance.post(
        "/admin/benefits",
        { name: benefitForm.name, description: benefitForm.description },
        { validateStatus: () => true }
      );
      if (res.status === 201) {
        // After creating, fetch first page with current search
        await fetchBenefits(1, searchTerm);
        setBenefitForm({ id: null, name: "", description: "" });
        navigate(ADMIN_ROUTES.BENEFITS);
      } else if (res.status === 400) {
        setErrors(res.data.errors || {});
      } else {
        console.error("Unexpected status:", res.status, res.data);
      }
    } catch (err) {
      console.error("Network error creating benefit:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update existing benefit
  const updateBenefit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await axiosInstance.put(
        `/admin/benefits/${benefitForm.id}`,
        { name: benefitForm.name, description: benefitForm.description },
        { validateStatus: () => true }
      );
      if (res.status === 200) {
        // After updating, re-fetch current page
        await fetchBenefits(currentPage, searchTerm);
        setBenefitForm({ id: null, name: "", description: "" });
        navigate(ADMIN_ROUTES.BENEFITS);
      } else if (res.status === 400) {
        setErrors(res.data.errors || {});
      } else {
        console.error("Unexpected status:", res.status, res.data);
      }
    } catch (err) {
      console.error("Network error updating benefit:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle status, then re-fetch list
  const toggleBenefitStatus = async (benefitId, currentStatus) => {
    setLoading(true);
    setErrors({});
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      const res = await axiosInstance.patch(
        `/admin/benefits/${benefitId}`,
        { status: newStatus },
        { validateStatus: () => true }
      );
      if (res.status === 200) {
        await fetchBenefits(currentPage, searchTerm);
      } else if (res.status === 400) {
        setErrors(res.data.errors || {});
      } else {
        console.error("Unexpected status:", res.status, res.data);
      }
    } catch (err) {
      console.error("Network error toggling status:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination clicks
  const handlePagechange = (page) => {
    setCurrentPage(page);
    fetchBenefits(page, searchTerm);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBenefitForm((prev) => ({ ...prev, [name]: value }));
  };

  return {
    showModal,
    setShowModal,
    benefitForm,
    setBenefitForm,
    handleSearch,
    createBenefit,
    updateBenefit,
    toggleBenefitStatus,
    handlePagechange,
    benefits,
    errors,
    loading,
    searchTerm,
    limit,
    setLimit,
    currentPage,
    totalPages,
    handleInputChange,
  };
};

export default useAdminBenefits;
