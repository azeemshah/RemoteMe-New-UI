import { useState, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";
export default function useMyOrgInvoices(initialPage = 1, initialLimit = 10) {
  const [listLoading, setListLoading] = useState(false);
  const [singleLoading, setSingleLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(0);
  const [listError, setListError] = useState(null);
  const [invoiceError, setInvoiceError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [financialDetails, setFinancialDetails] = useState(null);
  const [orgUser, setOrgUser] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [invoiceData, setInvoiceData] = useState({
    payment_description: "",
    payment_receipt: null,
  });

  const [updating, setUpdating] = useState(false);

  const [toggleEdit, setToggleEdit] = useState(false);

  const fetchInvoices = async (query = "", page = 1) => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await axiosInstance.get("/org-invoices", {
        params: { page, limit, search: query, status: statusFilter },
      });

      setInvoices(res.data.invoices);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setListError("Failed to load invoices");
    } finally {
      setListLoading(false);
    }
  };

  const fetchSingleInvoice = async (id) => {
    setSingleLoading(true);
    try {
      const res = await axiosInstance.get(`/org-invoices/${id}`);
      if (res.status === 200) {
        setInvoice(res.data.invoice);
        setFinancialDetails(res.data.financialDetails || null);
        setOrgUser(res.data.orgUser || null);
        setAdminUser(res.data.adminUser || null);
        setInvoiceData({
          payment_description: res.data.invoice.payment_description || "",
          payment_receipt: null,
        });
        setInvoiceError(null);
      } else if (res.status === 404) {
        setInvoiceError("Invoice not found");
      } else if (res.status === 400) {
        setInvoiceError("Failed to load invoice");
      }
      return res.data;
    } catch (err) {
      setInvoiceError("Failed to load invoice");
    } finally {
      setSingleLoading(false);
    }
  };

  const debounced = useCallback(
    debounce((q) => {
      setPage(1);
      fetchInvoices(q, 1);
    }, 500),
    [limit]
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    debounced(e.target.value);
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});
    setInvoiceError(null);
    setUpdating(true);
    const formData = new FormData();
    formData.append("payment_description", invoiceData.payment_description);

    if (invoiceData.payment_receipt) {
      formData.append("payment_receipt", invoiceData.payment_receipt);
    }

    try {
      const res = await axiosInstance.patch(
        `/org-invoices/${invoice._id}`,
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );
      if (res.status === 200) {
        setSuccessMessage("Invoice payment submitted successfully");
        fetchSingleInvoice(invoice._id);
        setToggleEdit(false);
      } else if (res.status === 404) {
        setInvoiceError("Selected Invoice is invalid");
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      }
    } catch (err) {
      setListError("Failed to load invoices");
    } finally {
      setUpdating(false);
    }
  };

  return {
    fetchInvoices,
    listLoading,
    invoices,
    page,
    setPage,
    totalPages,
    limit,
    setLimit,
    listError,
    searchTerm,
    handleSearch,
    statusFilter,
    setStatusFilter,
    fetchSingleInvoice,
    singleLoading,
    invoiceError,
    invoice,
    handleInvoiceSubmit,
    invoiceData,
    setInvoiceData,
    errors,
    successMessage,
    updating,
    toggleEdit,
    setToggleEdit,
    financialDetails,
    adminUser,
    orgUser,
  };
}
