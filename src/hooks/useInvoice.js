import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";

export default function useInvoices(initialPage = 1, initialLimit = 10) {
  // List & pagination state
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(null);

  // Detail state
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [leaves, setLeaves] = useState(0);
  const [workingDays, setWorkingDays] = useState(0);
  const [missingTimesheets, setMissingTimesheets] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Change request state
  const [changeRequestLoading, setChangeRequestLoading] = useState(false);
  const [changeRequestError, setChangeRequestError] = useState(null);

  // Submit invoice state
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch paginated list
  const fetchList = useCallback(
    async (p = page, l = limit) => {
      setListLoading(true);
      setListError(null);
      try {
        const res = await axiosInstance.get("/employee/invoice", {
          params: { page: p, limit: l },
        });
        const { invoices, page: rp, total, limit: rl } = res.data;
        setInvoices(invoices);
        setPage(rp);
        setTotal(total);
        setLimit(rl);
      } catch (err) {
        setListError("Failed to load invoices");
      } finally {
        setListLoading(false);
      }
    },
    [page, limit]
  );

  // Auto‐fetch when page/limit change
  useEffect(() => {
    fetchList(page, limit);
  }, [fetchList, page, limit]);

  // Default‐select first invoice
  useEffect(() => {
    if (invoices.length && !selectedId) {
      setSelectedId(invoices[0]._id);
    }
  }, [invoices, selectedId]);

  // Fetch detail + leaves whenever selectedId changes
  const fetchInvoiceDetail = async (invoiceId) => {
    if (!invoiceId) return;
    setDetailLoading(true);
    setDetailError(null);
    try {
      const res = await axiosInstance.get(`/employee/invoice/${invoiceId}`);

      // Handle the new API response structure
      if (res.data.invoice) {
        // New structure: { invoice: {...}, remaining_amount: ..., paid_amount: ... }
        setDetail({
          ...res.data.invoice,
          remaining_amount: res.data.remaining_amount,
          paid_amount: res.data.paid_amount,
        });
      } else {
        // Old structure: direct invoice data
        setDetail(res.data.invoice || res.data);
      }

      setLeaves(res.data.leaves);
      setWorkingDays(res.data.working_days);
      setMissingTimesheets(res.data.missing_timesheets_count);
    } catch (err) {
      setDetailError("Failed to load invoice details");
    } finally {
      setDetailLoading(false);
    }
  };

  // Payment history state
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);
  const [currentPaymentPage, setCurrentPaymentPage] = useState(1);
  const [paymentPageSize, setPaymentPageSize] = useState(10);
  const [totalPaymentPages, setTotalPaymentPages] = useState(0);

  // Get payments for an invoice
  const getPayments = useCallback(
    async (invoiceId) => {
      setPaymentsLoading(true);
      setPaymentsError(null);

      try {
        const response = await axiosInstance.get(
          `/employee/payments/${invoiceId}`,
          {
            params: {
              page: currentPaymentPage,
              limit: paymentPageSize,
            },
            validateStatus: function (status) {
              return status >= 200 && status < 600;
            },
          }
        );

        if (response.status === 200) {
          // Handle the new paginated response structure
          if (response.data.payments && Array.isArray(response.data.payments)) {
            // New structure: { payments: [...], total: X, page: X, limit: X }
            setPayments(response.data.payments);
            setTotalPaymentPages(
              Math.ceil(response.data.total / response.data.limit)
            );
          } else if (Array.isArray(response.data)) {
            // Fallback: simple array response
            setPayments(response.data);
            setTotalPaymentPages(1);
          } else {
            // Fallback: empty response
            setPayments([]);
            setTotalPaymentPages(0);
          }
          return response.data;
        } else if (response.status === 400) {
          const { data } = response;
          setPaymentsError(
            data?.message || "Invalid request. Please check the parameters."
          );
          throw new Error(
            data?.message || "Invalid request. Please check the parameters."
          );
        } else if (response.status === 404) {
          setPaymentsError("Payments not found.");
          throw new Error("Payments not found.");
        } else if (response.status === 500) {
          setPaymentsError("Server error. Please try again later.");
          throw new Error("Server error. Please try again later.");
        } else {
          setPaymentsError("Failed to fetch payments.");
          throw new Error("Failed to fetch payments.");
        }
      } catch (err) {
        if (err.response) {
          const { status, data } = err.response;

          if (status === 401) {
            setPaymentsError("Unauthorized. Please check your authentication.");
            throw new Error("Unauthorized. Please check your authentication.");
          } else if (status === 403) {
            setPaymentsError(
              "Forbidden. You do not have permission to view payments."
            );
            throw new Error(
              "Forbidden. You do not have permission to view payments."
            );
          } else {
            setPaymentsError(data?.message || "Failed to fetch payments.");
            throw new Error(data?.message || "Failed to fetch payments.");
          }
        } else {
          setPaymentsError("Network error. Please check your connection.");
          throw new Error("Network error. Please check your connection.");
        }
      } finally {
        setPaymentsLoading(false);
      }
    },
    [currentPaymentPage, paymentPageSize]
  );

  useEffect(() => {
    fetchInvoiceDetail(selectedId);
  }, [selectedId]);

  // Refetch payments when pagination changes
  useEffect(() => {
    if (selectedId && currentPaymentPage > 0) {
      getPayments(selectedId);
    }
  }, [selectedId, currentPaymentPage, paymentPageSize, getPayments]);

  // Handle payment page change
  const handlePaymentPageChange = (page) => {
    setCurrentPaymentPage(page);
  };

  // Handle payment page size change
  const handlePaymentPageSizeChange = (newSize) => {
    setPaymentPageSize(newSize);
    setCurrentPaymentPage(1);
  };

  // Submit change request
  const submitChangeRequest = async (invoiceId, comment) => {
    setChangeRequestLoading(true);
    setChangeRequestError(null);

    try {
      const payload = { comment: comment };
      const response = await axiosInstance.put(
        `/employee/invoice/${invoiceId}/change-request`,
        payload,
        {
          validateStatus: function (status) {
            // Don't throw on 400 and 500, handle them in try block
            return status >= 200 && status < 600;
          },
        }
      );

      if (response.status === 200) {
        // Refresh invoice details to get updated status
        await fetchInvoiceDetail(invoiceId);
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;

        // Handle validation errors with specific field errors
        if (data?.errors && typeof data.errors === "object") {
          const errorMessages = Object.values(data.errors).flat();
          const finalError =
            errorMessages.join(", ") ||
            data?.message ||
            "Invalid request. Please check your comment.";
          setChangeRequestError(finalError);
        } else {
          const finalError =
            data?.message || "Invalid request. Please check your comment.";
          setChangeRequestError(finalError);
        }
      } else if (response.status === 500) {
        setChangeRequestError("Server error. Please try again later.");
      } else {
        setChangeRequestError("Failed to submit change request.");
      }
    } catch (err) {
      // Only handle network errors (no response)
      if (!err.response) {
        setChangeRequestError("Network error. Please check your connection.");
      } else {
        setChangeRequestError("An unexpected error occurred.");
      }
    } finally {
      setChangeRequestLoading(false);
    }
  };

  // Submit invoice
  const submitInvoice = async (invoiceId) => {
    setSubmitLoading(true);
    setSubmitError(null);

    try {
      const response = await axiosInstance.put(
        `/employee/invoice/${invoiceId}/submit`,
        {},
        {
          validateStatus: function (status) {
            // Don't throw on 400 and 500, handle them in try block
            return status >= 200 && status < 600;
          },
        }
      );

      if (response.status === 200) {
        // Refresh invoice details to get updated status
        await fetchInvoiceDetail(invoiceId);
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;
        const finalError =
          data?.message || "Invalid request. Please check the invoice.";
        setSubmitError(finalError);
      } else if (response.status === 500) {
        setSubmitError("Server error. Please try again later.");
      } else {
        setSubmitError("Failed to submit invoice.");
      }
    } catch (err) {
      // Only handle network errors (no response)
      if (!err.response) {
        setSubmitError("Network error. Please check your connection.");
      } else {
        setSubmitError("An unexpected error occurred.");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Invoice history state
  const [invoiceHistory, setInvoiceHistory] = useState(null);
  const [invoiceHistoryLoading, setInvoiceHistoryLoading] = useState(false);
  const [invoiceHistoryError, setInvoiceHistoryError] = useState(null);

  // Get invoice history by invoiceId
  const getInvoiceHistory = useCallback(async (invoiceId) => {
    setInvoiceHistoryLoading(true);
    setInvoiceHistoryError(null);
    try {
      const response = await axiosInstance.get(
        `/employee/invoice-history/${invoiceId}`,
        {
          validateStatus: function (status) {
            return status >= 200 && status < 600;
          },
        }
      );
      if (response.status === 200) {
        setInvoiceHistory(response.data);
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;
        setInvoiceHistoryError(
          data?.message || "Invalid request. Please check the parameters."
        );
        throw new Error(
          data?.message || "Invalid request. Please check the parameters."
        );
      } else if (response.status === 404) {
        setInvoiceHistoryError("Invoice history not found.");
        throw new Error("Invoice history not found.");
      } else if (response.status === 500) {
        setInvoiceHistoryError("Server error. Please try again later.");
        throw new Error("Server error. Please try again later.");
      } else {
        setInvoiceHistoryError("Failed to fetch invoice history.");
        throw new Error("Failed to fetch invoice history.");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 401) {
          setInvoiceHistoryError(
            "Unauthorized. Please check your authentication."
          );
          throw new Error("Unauthorized. Please check your authentication.");
        } else if (status === 403) {
          setInvoiceHistoryError(
            "Forbidden. You do not have permission to view invoice history."
          );
          throw new Error(
            "Forbidden. You do not have permission to view invoice history."
          );
        } else {
          setInvoiceHistoryError(
            data?.message || "Failed to fetch invoice history."
          );
          throw new Error(data?.message || "Failed to fetch invoice history.");
        }
      } else {
        setInvoiceHistoryError("Network error. Please check your connection.");
        throw new Error("Network error. Please check your connection.");
      }
    } finally {
      setInvoiceHistoryLoading(false);
    }
  }, []);

  return {
    // list
    invoices,
    page,
    limit,
    total,
    listLoading,
    listError,
    setPage,
    setLimit,

    // detail + selection
    selectedId,
    selectInvoice: setSelectedId,
    detail,
    leaves,
    workingDays,
    missingTimesheets,
    detailLoading,
    detailError,

    // change request
    submitChangeRequest,
    changeRequestLoading,
    changeRequestError,

    // submit invoice
    submitInvoice,
    submitLoading,
    submitError,

    // payments
    getPayments,
    payments,
    paymentsLoading,
    paymentsError,
    currentPaymentPage,
    paymentPageSize,
    totalPaymentPages,
    handlePaymentPageChange,
    handlePaymentPageSizeChange,
    // Invoice history
    getInvoiceHistory,
    invoiceHistory,
    invoiceHistoryLoading,
    invoiceHistoryError,
  };
}
