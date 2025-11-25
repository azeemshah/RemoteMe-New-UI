import { useCallback, useMemo, useState } from "react";
import axiosInstance from "../services/axiosService";
import { debounce, getOrganizationsDD } from "../helpers";
import { useAuth } from "./useAuth";

export const useGeneralInvoice = () => {
  const { user } = useAuth();
  const defaultCurrency = useMemo(
    () => ({
      value: user?.setting.currency._id || null,
      label: user?.setting.currency.code || null,
      countryCode: user?.setting.currency.code2 || null,
      symbol: user?.setting.currency.symbol || null,
    }),
    [user]
  );

  const defaultOrg = useMemo(
    () => ({ value: "", label: "All Organizations" }),
    []
  );

  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // const [downloading, setDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [orgInvoices, setOrgInvoices] = useState([]);
  const [errors, setErrors] = useState({});
  const [selectedCurrency, setSelectedCurrency] = useState(defaultCurrency);
  const [selectedOrg, setSelectedOrg] = useState(defaultOrg);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // const [downloadError, setDownloadError] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    payment_receipt: null,
    payment_description: "",
  });

  const [loadingId, setLoadingId] = useState(null);
  const [orgInvoice, setOrgInvoice] = useState(null);

  const intialInvoiceItem = useMemo(
    () => ({
      organizationId: "",
      currencyId: user?.setting.currency._id || "",
      status: "invoiced",
      invoiceItems: [
        {
          description: "",
          quantity: 1,
          amount: 0,
        },
      ],
    }),
    []
  );

  const [invoiceForm, setInvoiceForm] = useState(intialInvoiceItem);

  const fetchOrganizations = async () => {
    getOrganizationsDD(setOrganizations);
  };

  const getList = async (page = 1, query = "") => {
    setLoading(true);

    try {
      const res = await axiosInstance.get(
        `/admin/general-invoices?page=${page}&limit=${limit}&search=${encodeURIComponent(
          query
        )}&organizationId=${organizationId}&status=${statusFilter}`
      );
      if (res.status === 200) {
        setInvoices(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching general invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const getOrgInvoices = async (page = 1, query = "") => {
    setLoading(true);

    try {
      const res = await axiosInstance.get(
        `/organization/general-invoices?page=${page}&limit=${limit}&search=${encodeURIComponent(
          query
        )}&status=${statusFilter}`
      );
      if (res.status === 200) {
        setOrgInvoices(res.data.data);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching general invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      setSearchTerm(q);
    }, 500),
    []
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearch(q);
    debouncedSearch(q);
  };

  const saveInvoice = async () => {
    setSaving(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const res = await axiosInstance.post(
        "/admin/general-invoices",
        invoiceForm
      );
      if (res.status === 201) {
        setSuccessMessage("Invoice created successfully.");
        setInvoiceForm(() => intialInvoiceItem);
        setSelectedCurrency(defaultCurrency);
        setSelectedOrg({});
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else {
        setErrorMessage("An error occurred while saving the invoice.");
      }
    } catch (err) {
      console.error("Error saving general invoice:", err);
      setErrorMessage("An error occurred while saving the invoice.");
    } finally {
      setSaving(false);
    }
  };

  const getInvoice = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/general-invoices/${id}`);

      if (res.status === 200) {
        setInvoiceForm(res.data.invoice);
        setSelectedOrg(res.data.organization);
        setSelectedCurrency(res.data.currency);
      } else if (res.status === 404) {
        setErrorMessage("Invoice not found.");
      } else if (res.status === 400) {
        setErrorMessage("Invalid Invoice ID.");
      }
    } catch (err) {
      console.error("Error fetching general invoice:", err);
      setErrorMessage("Error fetching general invoice");
    } finally {
      setLoading(false);
    }
  };
  const getOrgInvoice = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/organization/general-invoices/${id}`
      );

      if (res.status === 200) {
        setOrgInvoice(res.data);
      } else if (res.status === 404) {
        setErrorMessage("Invoice not found.");
      } else if (res.status === 400) {
        setErrorMessage("Invalid Invoice ID.");
      }
    } catch (err) {
      console.error("Error fetching organization invoice:", err);
      setErrorMessage("Error fetching organization invoice");
    } finally {
      setLoading(false);
    }
  };
  const getAdminInvoice = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/general-invoices/${id}/details`
      );

      if (res.status === 200) {
        setOrgInvoice(res.data);
      } else if (res.status === 404) {
        setErrorMessage("Invoice not found.");
      } else if (res.status === 400) {
        setErrorMessage("Invalid Invoice ID.");
      }
    } catch (err) {
      console.error("Error fetching organization invoice:", err);
      setErrorMessage("Error fetching organization invoice");
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (invoiceId) => {
    setSaving(true);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
    try {
      const res = await axiosInstance.put(
        `/admin/general-invoices/${invoiceId}`,
        invoiceForm
      );
      if (res.status === 200) {
        setSuccessMessage("Invoice updated successfully.");
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else if (res.status === 404) {
        setErrorMessage("Invoice not found.");
      } else {
        setErrorMessage("An error occurred while updating the invoice.");
      }
    } catch (err) {
      console.error("Error updating general invoice:", err);
      setErrorMessage("An error occurred while updating the invoice.");
    } finally {
      setSaving(false);
    }
  };

  const updateInvoiceStatus = async (invoiceId, status) => {
    setLoadingId(invoiceId);
    try {
      const res = await axiosInstance.patch(
        `/admin/general-invoices/${invoiceId}`,
        { status }
      );
      getList(currentPage, searchTerm);
    } catch (err) {
      console.error("Error updating invoice status:", err);
      setErrorMessage("An error occurred while updating the invoice status.");
    } finally {
      setLoadingId(null);
    }
  };

  const handlePaymentForm = (e) => {
    const { name, value, files } = e.target;
    if (name === "payment_receipt") {
      setPaymentForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setPaymentForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitPayment = async (id) => {
    setSaving(true);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const formData = new FormData();
      if (paymentForm.payment_receipt) {
        formData.append("payment_receipt", paymentForm.payment_receipt);
      }
      formData.append("payment_description", paymentForm.payment_description);

      const res = await axiosInstance.patch(
        `/organization/general-invoices/${id}/submit-payment`,
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );

      if (res.status === 200) {
        setSuccessMessage("Payment submitted successfully.");
        getOrgInvoice(id);
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else if (res.status === 404) {
        setErrorMessage("Invoice not found.");
      } else {
        setErrorMessage("An error occurred while submitting the payment.");
      }
    } catch (err) {
      console.error("Error submitting payment:", err);
      setErrorMessage("An error occurred while submitting the payment.");
    } finally {
      setSaving(false);
    }
  };

  // const download = async (id) => {
  //   try {
  //     setDownloading(true);
  //     setDownloadError(null);
  //     const result = await axiosInstance.get(
  //       `organization/general-invoices/${id}/download`,
  //       {
  //         responseType: "blob",
  //       }
  //     );

  //     if (result.status === 400) {
  //       setDownloadError("Invalid invoice or invoice has not been paid yet.");
  //       setTimeout(() => setDownloadError(null), 5000);
  //     } else {
  //       const blob = await result.data;
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement("a");
  //       a.href = url;
  //       a.download = `invoice-${id}.pdf`;
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //     }
  //   } catch (error) {
  //     console.error("Error downloading invoice:", error);
  //   } finally {
  //     setDownloading(false);
  //   }
  // };

  return {
    organizations,
    fetchOrganizations,
    statusFilter,
    setStatusFilter,
    limit,
    setLimit,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    searchTerm,
    handleSearch,
    getList,
    organizationId,
    setOrganizationId,
    invoices,
    search,
    invoiceForm,
    handleFormChange,
    errors,
    saving,
    selectedCurrency,
    setSelectedCurrency,
    setInvoiceForm,
    saveInvoice,
    successMessage,
    errorMessage,
    selectedOrg,
    setSelectedOrg,
    getInvoice,
    updateInvoice,
    updateInvoiceStatus,
    loadingId,
    getOrgInvoices,
    orgInvoices,
    getOrgInvoice,
    orgInvoice,
    // download,
    // downloading,
    // downloadError,
    paymentForm,
    setPaymentForm,
    handlePaymentForm,
    handleSubmitPayment,
    getAdminInvoice,
  };
};
