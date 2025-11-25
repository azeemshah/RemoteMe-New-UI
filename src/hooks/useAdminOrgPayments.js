import { useState, useCallback, useRef } from "react";
import axiosInstance from "../services/axiosService";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { getNotificationActions } from "../helpers";

export default function useAdminOrgPayments() {
  const [loading, setLoading] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [cycleBreakdown, setCycleBreakdown] = useState(null);
  const [cycleOverview, setCycleOverview] = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [breakdownError, setBreakdownError] = useState(null);
  const [overviewError, setOverviewError] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);
  const [employeeInvoices, setEmployeeInvoices] = useState(null);
  const [employeeInvoicesLoading, setEmployeeInvoicesLoading] = useState(false);
  const [employeeInvoicesError, setEmployeeInvoicesError] = useState(null);
  const [monthFilter, setMonthFilter] = useState("");

  const [totalPages, setTotalPages] = useState(1);

  // Payment related state
  const [payments, setPayments] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [createPaymentError, setCreatePaymentError] = useState(null);
  const [createPaymentFieldErrors, setCreatePaymentFieldErrors] = useState({});

  // Create invoice from existing invoice state
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  // Invoice items state (for dropdowns)
  const [invoiceItems, setInvoiceItems] = useState(null);
  const [invoiceItemsLoading, setInvoiceItemsLoading] = useState(false);
  const [invoiceItemsError, setInvoiceItemsError] = useState(null);

  // Bank details state
  const [bankDetails, setBankDetails] = useState(null);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [bankDetailsError, setBankDetailsError] = useState(null);
  const [missingBankDetail, setMissingBankDetail] = useState([]);

  // Invoice history state
  const [invoiceHistory, setInvoiceHistory] = useState(null);
  const [invoiceHistoryLoading, setInvoiceHistoryLoading] = useState(false);
  const [invoiceHistoryError, setInvoiceHistoryError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  const payDocRef = useRef(null);

  const getCycleBreakdown = useCallback(async (cycleId) => {
    setBreakdownLoading(true);
    setBreakdownError(null);

    try {
      const response = await axiosInstance.get(
        `/admin/payments/cycle-breakdown/${cycleId}`
      );

      if (response.status === 200) {
        setCycleBreakdown(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Error fetching cycle breakdown:", err);

      if (err.response) {
        const { status, data } = err.response;

        if (status === 404) {
          setBreakdownError("Cycle breakdown not found.");
        } else if (status === 500) {
          setBreakdownError("Server error. Please try again later.");
        } else {
          setBreakdownError(
            data?.message || "Failed to fetch cycle breakdown."
          );
        }
      } else {
        setBreakdownError("Network error. Please check your connection.");
      }

      throw err;
    } finally {
      setBreakdownLoading(false);
    }
  }, []);

  const getCycleOverview = useCallback(async (cycleId) => {
    setOverviewLoading(true);
    setOverviewError(null);

    try {
      const response = await axiosInstance.get(
        `/admin/payments/cycle-overview/${cycleId}`
      );

      if (response.status === 200) {
        setCycleOverview(response.data);
        return response.data;
      }
    } catch (err) {
      console.error("Error fetching cycle overview:", err);

      if (err.response) {
        const { status, data } = err.response;

        if (status === 404) {
          setOverviewError("Cycle overview not found.");
        } else if (status === 500) {
          setOverviewError("Server error. Please try again later.");
        } else {
          setOverviewError(data?.message || "Failed to fetch cycle overview.");
        }
      } else {
        setOverviewError("Network error. Please check your connection.");
      }

      throw err;
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const getInvoices = useCallback(async (page = 1, limit = 10, month = "") => {
    setInvoicesLoading(true);
    setInvoicesError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());
      if (month !== "") params.append("month", month.toString());

      const url = `/organization/invoices${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await axiosInstance.get(url);

      if (response.status === 200) {
        setInvoices(response.data);
        setTotalPages(response.data.totalPages || 1);
        return response.data;
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);

      if (err.response) {
        const { status, data } = err.response;

        if (status === 404) {
          setInvoicesError("Invoices not found.");
        } else if (status === 500) {
          setInvoicesError("Server error. Please try again later.");
        } else {
          setInvoicesError(data?.message || "Failed to fetch invoices.");
        }
      } else {
        setInvoicesError("Network error. Please check your connection.");
      }

      throw err;
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  const getEmployeeInvoiceList = useCallback(
    async (cycleId, search = "", status = "", page = 1, limit = 10) => {
      setEmployeeInvoicesLoading(true);
      setEmployeeInvoicesError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status && status !== "all") params.append("status", status);
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());

        const url = `/admin/payments/employee-list/${cycleId}${
          params.toString() ? "?" + params.toString() : ""
        }`;
        const response = await axiosInstance.get(url);

        if (response.status === 200) {
          setEmployeeInvoices(response.data);
          return response.data;
        }
      } catch (err) {
        console.error("Error fetching employee invoices:", err);

        if (err.response) {
          const { status, data } = err.response;

          if (status === 404) {
            setEmployeeInvoicesError("Employee invoices not found.");
          } else if (status === 500) {
            setEmployeeInvoicesError("Server error. Please try again later.");
          } else {
            setEmployeeInvoicesError(
              data?.message || "Failed to fetch employee invoices."
            );
          }
        } else {
          setEmployeeInvoicesError(
            "Network error. Please check your connection."
          );
        }

        throw err;
      } finally {
        setEmployeeInvoicesLoading(false);
      }
    },
    []
  );

  const getEmployeeInvoice = useCallback(async (cycleId, employeeId) => {
    try {
      const url = `/admin/payments/${cycleId}/employee/${employeeId}`;

      const response = await axiosInstance.get(url, {
        validateStatus: function (status) {
          // Don't throw on 400 and 500, handle them in try block
          return status >= 200 && status < 600;
        },
      });

      if (response.status === 200) {
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;
        throw new Error(
          data?.message || "Invalid request. Please check the parameters."
        );
      } else if (response.status === 404) {
        throw new Error("Employee invoice not found.");
      } else if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error("Failed to fetch employee invoice.");
      }
    } catch (err) {
      console.error("Error fetching employee invoice:", err);

      if (err.response) {
        const { status, data } = err.response;

        if (status === 404) {
          throw new Error("Employee invoice not found.");
        } else if (status === 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(data?.message || "Failed to fetch employee invoice.");
        }
      } else {
        throw new Error("Network error. Please check your connection.");
      }
    }
  }, []);

  // Get payments for an invoice
  const getPayments = useCallback(async (invoiceId) => {
    setPaymentsLoading(true);
    setPaymentsError(null);

    try {
      const response = await axiosInstance.get(`/admin/payments/${invoiceId}`, {
        validateStatus: function (status) {
          return status >= 200 && status < 600;
        },
      });

      if (response.status === 200) {
        setPayments(response.data);
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
  }, []);

  // Create a new payment for an invoice
  const createPayment = useCallback(
    async (invoiceId, payload) => {
      setCreatingPayment(true);
      setCreatePaymentError(null);
      setCreatePaymentFieldErrors({});

      try {
        // Handle both FormData (for file upload) and regular object (for amount only)
        const requestPayload =
          payload instanceof FormData ? payload : { amount: payload };

        const response = await axiosInstance.post(
          `/admin/payments/${invoiceId}`,
          requestPayload,
          {
            validateStatus: function (status) {
              return status >= 200 && status < 600;
            },
            headers:
              payload instanceof FormData
                ? {
                    "Content-Type": undefined,
                  }
                : {
                    "Content-Type": "application/json",
                  },
          }
        );

        if (response.status === 200 || response.status === 201) {
          if (payDocRef.current) {
            payDocRef.current.value = "";
          }
          // Refresh payments list after successful creation
          await getPayments(invoiceId);
          return response.data;
        } else if (response.status === 400) {
          const { data } = response;
          setCreatePaymentError(
            data?.message || "Invalid request. Please check the parameters."
          );
          setCreatePaymentFieldErrors(data?.errors || {});
          return {
            error: true,
            status: 400,
            message:
              data?.message || "Invalid request. Please check the parameters.",
            fieldErrors: data?.errors || {},
          };
        } else if (response.status === 422) {
          const { data } = response;
          setCreatePaymentError(
            data?.message || "Validation failed. Please check your input."
          );
          setCreatePaymentFieldErrors(data?.errors || {});
          return {
            error: true,
            status: 422,
            message:
              data?.message || "Validation failed. Please check your input.",
            fieldErrors: data?.errors || {},
          };
        } else if (response.status === 404) {
          setCreatePaymentError("Invoice not found.");
          throw new Error("Invoice not found.");
        } else if (response.status === 500) {
          setCreatePaymentError("Server error. Please try again later.");
          throw new Error("Server error. Please try again later.");
        } else {
          setCreatePaymentError("Failed to create payment.");
          throw new Error("Failed to create payment.");
        }
      } catch (err) {
        if (err.response) {
          const { status, data } = err.response;

          if (status === 401) {
            setCreatePaymentError(
              "Unauthorized. Please check your authentication."
            );
            throw new Error("Unauthorized. Please check your authentication.");
          } else if (status === 403) {
            setCreatePaymentError(
              "Forbidden. You do not have permission to create payments."
            );
            throw new Error(
              "Forbidden. You do not have permission to create payments."
            );
          } else {
            setCreatePaymentError(data?.message || "Failed to create payment.");
            throw new Error(data?.message || "Failed to create payment.");
          }
        } else {
          setCreatePaymentError("Network error. Please check your connection.");
          throw new Error("Network error. Please check your connection.");
        }
      } finally {
        setCreatingPayment(false);
      }
    },
    [getPayments]
  );

  // Get invoice items for dropdowns
  const getInvoiceItems = useCallback(async (page = 1, limit = 10) => {
    setInvoiceItemsLoading(true);
    setInvoiceItemsError(null);

    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());

      const url = `/organization/invoice-items${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await axiosInstance.get(url, {
        validateStatus: function (status) {
          return status >= 200 && status < 600;
        },
      });

      if (response.status === 200) {
        setInvoiceItems(response.data);
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;
        setInvoiceItemsError(
          data?.message || "Invalid request. Please check the parameters."
        );
        throw new Error(
          data?.message || "Invalid request. Please check the parameters."
        );
      } else if (response.status === 404) {
        setInvoiceItemsError("Invoice items not found.");
        throw new Error("Invoice items not found.");
      } else if (response.status === 500) {
        setInvoiceItemsError("Server error. Please try again later.");
        throw new Error("Server error. Please try again later.");
      } else {
        setInvoiceItemsError("Failed to fetch invoice items.");
        throw new Error("Failed to fetch invoice items.");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 401) {
          setInvoiceItemsError(
            "Unauthorized. Please check your authentication."
          );
          throw new Error("Unauthorized. Please check your authentication.");
        } else if (status === 403) {
          setInvoiceItemsError(
            "Forbidden. You do not have permission to view invoice items."
          );
          throw new Error(
            "Forbidden. You do not have permission to view invoice items."
          );
        } else {
          setInvoiceItemsError(
            data?.message || "Failed to fetch invoice items."
          );
          throw new Error(data?.message || "Failed to fetch invoice items.");
        }
      } else {
        setInvoiceItemsError("Network error. Please check your connection.");
        throw new Error("Network error. Please check your connection.");
      }
    } finally {
      setInvoiceItemsLoading(false);
    }
  }, []);

  // Get bank details for an invoice
  const getBankDetails = useCallback(async (invoiceId) => {
    setBankDetailsLoading(true);
    setBankDetailsError(null);

    try {
      const response = await axiosInstance.get(
        `/admin/payments/employee/${invoiceId}/bank-details`,
        {
          validateStatus: function (status) {
            return status >= 200 && status < 600;
          },
        }
      );

      if (response.status === 200) {
        setBankDetails(response.data);
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;
        setBankDetailsError(
          data?.message || "Invalid request. Please check the parameters."
        );
        throw new Error(
          data?.message || "Invalid request. Please check the parameters."
        );
      } else if (response.status === 404) {
        setBankDetailsError("Bank details not found.");
        throw new Error("Bank details not found.");
      } else if (response.status === 500) {
        setBankDetailsError("Server error. Please try again later.");
        throw new Error("Server error. Please try again later.");
      } else {
        setBankDetailsError("Failed to fetch bank details.");
        throw new Error("Failed to fetch bank details.");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 401) {
          setBankDetailsError(
            "Unauthorized. Please check your authentication."
          );
          throw new Error("Unauthorized. Please check your authentication.");
        } else if (status === 403) {
          setBankDetailsError(
            "Forbidden. You do not have permission to view bank details."
          );
          throw new Error(
            "Forbidden. You do not have permission to view bank details."
          );
        } else {
          setBankDetailsError(data?.message || "Failed to fetch bank details.");
          throw new Error(data?.message || "Failed to fetch bank details.");
        }
      } else {
        setBankDetailsError("Network error. Please check your connection.");
        throw new Error("Network error. Please check your connection.");
      }
    } finally {
      setBankDetailsLoading(false);
    }
  }, []);

  // Get invoice history by invoiceId
  const getInvoiceHistory = useCallback(async (invoiceId) => {
    setInvoiceHistoryLoading(true);
    setInvoiceHistoryError(null);
    try {
      const response = await axiosInstance.get(
        `/admin/payments/invoice-history/${invoiceId}`,
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

  const completeCycle = useCallback(async (cycleId) => {
    try {
      setInvoiceLoading(true);
      const result = await axiosInstance.get(
        `/organization/invoices/complete-cycle/${cycleId}`
      );
      if (result.status === 200) {
        enqueueSnackbar(
          "Invoice cycle has been marked as completed successfully.",
          {
            autoHideDuration: 5000,
            variant: "success",
            action: (snackbarId) =>
              getNotificationActions(snackbarId, closeSnackbar),
          }
        );
        getCycleBreakdown(cycleId);
      } else if (result.status === 400) {
        enqueueSnackbar(result.response.data.message, {
          autoHideDuration: 5000,
          variant: "error",
          action: (snackbarId) =>
            getNotificationActions(snackbarId, closeSnackbar),
        });
      }
    } catch (err) {
      console.error("Error completing cycle:", err);
    } finally {
      setInvoiceLoading(false);
    }
  }, []);

  const markCycleAsPaid = useCallback(async (cycleId) => {
    try {
      setMarkingPaid(true);
      const result = await axiosInstance.patch(
        `/admin/payments/mark-cycle-as-paid/${cycleId}`
      );
      if (result.status === 200) {
        enqueueSnackbar("Invoice cycle has been marked as paid successfully.", {
          autoHideDuration: 5000,
          variant: "success",
          action: (snackbarId) =>
            getNotificationActions(snackbarId, closeSnackbar),
        });
        getCycleBreakdown(cycleId);
      } else if (result.status === 400) {
        enqueueSnackbar(result.response.data.message, {
          autoHideDuration: 5000,
          variant: "error",
          action: (snackbarId) =>
            getNotificationActions(snackbarId, closeSnackbar),
        });
      }
    } catch (err) {
      console.error("Error marking cycle as paid:", err);
    } finally {
      setMarkingPaid(false);
    }
  }, []);

  return {
    getCycleBreakdown,
    getCycleOverview,
    getInvoices,
    getEmployeeInvoiceList,
    getEmployeeInvoice,
    getPayments,
    createPayment,
    cycleBreakdown,
    cycleOverview,
    invoices,
    employeeInvoices,
    payments,
    loading,
    error,
    fieldErrors,
    breakdownLoading,
    overviewLoading,
    invoicesLoading,
    employeeInvoicesLoading,
    paymentsLoading,
    creatingPayment,
    breakdownError,
    overviewError,
    invoicesError,
    employeeInvoicesError,
    paymentsError,
    createPaymentError,
    createPaymentFieldErrors,
    creatingInvoice,
    // Invoice items
    getInvoiceItems,
    invoiceItems,
    invoiceItemsLoading,
    invoiceItemsError,
    // Bank details
    getBankDetails,
    bankDetails,
    bankDetailsLoading,
    bankDetailsError,
    // Invoice history
    getInvoiceHistory,
    invoiceHistory,
    invoiceHistoryLoading,
    invoiceHistoryError,
    setMissingBankDetail,
    missingBankDetail,
    totalPages,
    monthFilter,
    setMonthFilter,
    payDocRef,
    completeCycle,
    invoiceLoading,
    markingPaid,
    markCycleAsPaid,
    showEdit,
    setShowEdit,
  };
}
