import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosService";

const useInvoiceItems = () => {
  const navigate = useNavigate();

  // Listing state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({ title: "", type: "" });
  const [errors, setErrors] = useState({}); // per-field errors
  const [formError, setFormError] = useState(null); // top-level message
  const [currentItem, setCurrentItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // 🔄 Fetch all items
  // Accept type filter
  const getItems = async (page = 1, pageLimit = 10, type = "all") => {
    setLoading(true);
    try {
      const params = { page, limit: pageLimit };
      if (type && type !== "all") {
        params.type = type;
      }
      const res = await axiosInstance.get("/organization/invoice-items", {
        params,
      });
      // Handle different response structures
      if (Array.isArray(res.data)) {
        setItems(res.data);
        setTotalPages(1);
      } else if (res.data.data && Array.isArray(res.data.data)) {
        setItems(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.page || 1);
        setLimit(res.data.limit || 10);
      } else if (res.data.additions && res.data.deductions) {
        // Handle the new structure with additions and deductions
        const combinedItems = [...res.data.additions, ...res.data.deductions];
        setItems(combinedItems);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.page || 1);
        setLimit(res.data.limit || 10);
      } else {
        setItems([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching invoice items:", err);
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 🖋️ Load one item into form for editing
  const getItem = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/organization/invoice-items/${id}`);
      setFormData({ title: res.data.title, type: res.data.type });
      setCurrentItem(res.data);
      setErrors({});
      setFormError(null);
    } catch (err) {
      console.error("Error loading invoice item:", err);
    } finally {
      setLoading(false);
    }
  };

  // ➕ Create new item
  const createItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError(null);
    try {
      const response = await axiosInstance.post("/organization/invoice-items", {
        title: formData.title.trim(),
        type: formData.type,
      });

      if (response.status === 201 || response.status === 200) {
        navigate("/organization/invoice-items");
      } else if (response.status === 400) {
        setErrors(response.response.data.errors || {});
      }
    } catch (err) {
      console.error("Unexpected create error:", err);
      setFormError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Update existing item
  const updateItem = async (e) => {
    e.preventDefault();
    if (!currentItem?._id) return;
    setLoading(true);
    setErrors({});
    setFormError(null);

    // Validate required fields
    if (!formData.title || !formData.title.trim()) {
      setErrors({ title: ["Title is required"] });
      setFormError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!formData.type) {
      setErrors({ type: ["Type is required"] });
      setFormError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/organization/invoice-items/${currentItem._id}`,
        {
          title: formData.title.trim(),
          type: formData.type,
        }
      );

      if (response.status === 200) {
        setSuccessMessage(response.data.message || "Item updated successfully");
      }
    } catch (err) {
      if (err.response?.status === 400) {
        const data = err.response.data;
        setFormError(data.message || "Validation failed");
        setErrors(data.errors || {});
      } else {
        console.error("Unexpected update error:", err);
        setFormError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✖️ If switching from edit back to add, reset form
  useEffect(() => {
    if (!currentItem) {
      setFormData({ title: "", type: "" });
      setErrors({});
      setFormError(null);
    }
  }, [currentItem]);

  // 🔥 initial load
  useEffect(() => {
    getItems();
  }, []);

  return {
    // listing
    items,
    loading,
    currentPage,
    limit,
    totalPages,
    getItems,

    // form
    formData,
    setFormData,
    errors, // e.g. errors.title
    formError, // e.g. "The given data was invalid."
    createItem,
    updateItem,
    getItem,
    currentItem,
    successMessage,
  };
};

export default useInvoiceItems;
