import { useState, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";

export default function useAdminInvoices(initialPage = 1, initialLimit = 10) {
  const [listLoading, setListLoading] = useState(false);
  const [singleLoading, setSingleLoading] = useState(false);
  const [markInvoicedLoading, setMarkInvoicedLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(0);
  const [listError, setListError] = useState(null);
  const [invoiceError, setInvoiceError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [invoiceAmount, setInvoiceAmount] = useState(0);

  const fetchInvoices = async (query = "", page = 1) => {
    setListLoading(true);
    setListError(null);
    try {
      const res = await axiosInstance.get("/admin/invoices", {
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

  const markAsInvoiced = async () => {
    setMarkInvoicedLoading(true);
    setSuccessMessage(null);
    setPaymentError(null);
    try {
      const res = await axiosInstance.patch(
        `/admin/organizations/${invoice._id}/send-invoice`,
        {
          invoiceAmount,
        }
      );

      if (res.status === 200) {
        setSuccessMessage("Invoice marked and sent successfully");
        fetchSingleInvoice(invoice._id);
      }

      if (res.status === 400) {
        setPaymentError(
          res.response.data.message || "Failed to mark as invoiced"
        );
      }
    } catch (err) {
      console.error(err);
      setPaymentError("Failed to mark as invoiced");
    } finally {
      setMarkInvoicedLoading(false);
    }
  };

  const fetchSingleInvoice = async (id) => {
    setSingleLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/invoices/${id}`);
      if (res.status === 200) {
        setInvoice(() => res.data);
        setInvoiceAmount(res.data.payable_amount || 0);
        setInvoiceError(null);
      } else if (res.status === 404) {
        setInvoiceError("Invoice not found");
      } else if (res.status === 400) {
        setInvoiceError("Failed to load invoice");
      }
      return res.data;
    } catch (err) {
      console.error(err);
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
    invoiceAmount,
    setInvoiceAmount,
    markAsInvoiced,
    markInvoicedLoading,
    paymentError,
    successMessage,
  };
}
