import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_ROUTES } from "../config/routes";

const useAdminDocument = () => {
  const [form, setForm] = useState({
    id: null,
    name: "",
    code: "",
    code2: "",
    symbol: "",
    exchange_rate: "",
    sub_unit_name: "",
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCurrency, setCurrentCurrency] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  // --- Fetch paginated list ---
  const getAllCurrencies = async (page = 1, query = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/currencies?page=${page}&limit=${limit}&search=${encodeURIComponent(
          query
        )}`
      );
      if (res.status === 200) {
        setCurrencies(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching currencies:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Debounced search ---
  const debouncedSearch = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      getAllCurrencies(1, q);
    }, 500),
    [limit]
  );

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchTerm(q);
    debouncedSearch(q);
  };
  const getCurrency = async (currId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/currencies/${currId}`);
      if (res.status === 200) {
        setForm({
          id: res.data._id,
          name: res.data.name,
          code: res.data.code,
          code2: res.data.code2,
          symbol: res.data.symbol,
          exchange_rate: res.data.exchange_rate,
          sub_unit_name: res.data.sub_unit_name,
        });
        setCurrentCurrency(res.data);
      }
    } catch (err) {
      console.error("Error loading currency:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) getCurrency(id);
  }, [id]);

  // --- Form handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Create ---
  const createCurrency = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const formData = {
      name: form.name,
      code: form.code,
      code2: form.code2,
      symbol: form.symbol,
      exchange_rate: parseFloat(form.exchange_rate),
      sub_unit_name: form.sub_unit_name,
    };

    try {
      const res = await axiosInstance.post("/admin/currencies", formData);
      if (res.status === 201) {
        navigate(ADMIN_ROUTES.CURRENCIES);
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else {
        console.error("Unexpected create status:", res.status);
      }
    } catch (err) {
      console.error("Error creating currency:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Update ---
  const updateCurrency = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const formData = {
      name: form.name,
      code: form.code,
      code2: form.code2,
      symbol: form.symbol,
      exchange_rate: parseFloat(form.exchange_rate),
      sub_unit_name: form.sub_unit_name,
    };

    try {
      const res = await axiosInstance.put(
        `/admin/currencies/${form.id}`,
        formData
      );
      if (res.status === 200) {
        navigate(ADMIN_ROUTES.CURRENCIES);
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else {
        console.error("Unexpected update status:", res.status);
      }
    } catch (err) {
      console.error("Error updating currency:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination ---
  const handlePagechange = (page) => {
    setCurrentPage(page);
    getAllCurrencies(page, searchTerm);
  };

  const handleBack = () => {
    navigate(ADMIN_ROUTES.CURRENCIES);
  };

  return {
    form,
    setForm,
    handleInputChange,
    createCurrency,
    updateCurrency,
    getAllCurrencies,
    getCurrency,
    currencies,
    loading,
    errors,
    searchTerm,
    handleSearch,
    limit,
    setLimit,
    currentPage,
    totalPages,
    handlePagechange,
    currentCurrency,
    handleBack,
  };
};

export default useAdminDocument;
