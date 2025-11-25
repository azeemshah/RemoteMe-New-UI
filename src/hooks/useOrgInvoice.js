import { useState, useCallback, useRef } from "react";
import axiosInstance from "../services/axiosService";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { getNotificationActions } from "../helpers";
import { useSearchParams } from "react-router-dom";

export default function useOrgInvoice() {
  const [loading, setLoading] = useState(false);
  const [voidingInvoice, setVoidingInvoice] = useState(false);
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
  const [invoiceData, setInvoiceData] = useState(null);

  // Payment related state
  const [payments, setPayments] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [createPaymentError, setCreatePaymentError] = useState(null);
  const [createPaymentFieldErrors, setCreatePaymentFieldErrors] = useState({});

  // Create invoice from existing invoice state
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [createInvoiceError, setCreateInvoiceError] = useState(null);

  // Invoice items state (for dropdowns)
  const [invoiceItems, setInvoiceItems] = useState(null);
  const [invoiceItemsLoading, setInvoiceItemsLoading] = useState(false);
  const [invoiceItemsError, setInvoiceItemsError] = useState(null);

  // Bank details state
  const [bankDetails, setBankDetails] = useState(null);
  const [bankDetailsLoading, setBankDetailsLoading] = useState(false);
  const [bankDetailsError, setBankDetailsError] = useState(null);
  const [missingBankDetail, setMissingBankDetail] = useState([]);

  const payDocRef = useRef(null);

  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const cycleId = searchParams.get("cycleId");

  /**
   * @param {number} month – e.g. 7 for July
   * @param {number} year – e.g. 2025
   * @returns {Promise<object|void>} – resolves with server data on success
   */
  const createInvoice = async (month, year) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      month: month.toString().padStart(2, "0"),
      year: year.toString(),
    };

    setMissingBankDetail([]);

    try {
      const result = await axiosInstance.post(
        "/organization/invoices",
        payload
      );

      // Success
      if (result.status === 200 || result.status === 201) {
        setMissingBankDetail(result.data.missing_bank_details || []);
        return result.data;
      }

      // Validation errors (e.g. missing fields)
      if (result.status === 422) {
        const errorData = result.response.data;
        if (errorData.message) {
          setError(errorData.message);
        } else {
          setFieldErrors(errorData.errors || {});
        }
        return;
      }

      // Bad request
      if (result.status === 400) {
        setError(
          result.response.data.message ||
            "Please correct the entries and try again."
        );
        return;
      }

      // Not found
      if (result.status === 404) {
        setError("Invalid invoice request. Please try again.");
        return;
      }

      // Server error
      if (result.status === 500) {
        console.error("Hook: 500 Error Response:", result);
        setError("Server error occurred. Please check backend logs.");
        return;
      }

      // Fallback for any other non‑2xx
      setError("Failed to create invoice. Please try again.");
    } catch (err) {
      // Network / server‑error fallback
      console.error("Hook: Error details:", err);
      console.error("Hook: Error response:", err.response);
      console.error("Hook: Error message:", err.message);

      // Check if it's a 500 error
      if (err.response && err.response.status === 500) {
        console.error("Hook: 500 Error - Full response:", err.response);
        console.error("Hook: 500 Error - Response data:", err.response.data);
        setError("Server error (500). Please check backend logs for details.");
      } else {
        setError(
          "An error occurred while creating the invoice. Please try again."
        );
      }
      console.error("Error creating invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCycleBreakdown = useCallback(async (cycleId) => {
    setBreakdownLoading(true);
    setBreakdownError(null);

    try {
      const response = await axiosInstance.get(
        `/organization/invoices/cycle-breakdown/${cycleId}`
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
        `/organization/invoices/cycle-overview/${cycleId}`
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

        const url = `/organization/invoices/employee-invoice-list/${cycleId}${
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
      const url = `/organization/invoices/${cycleId}/employee/${employeeId}`;

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

  const approveInvoice = useCallback(async (invoiceId) => {
    try {
      const response = await axiosInstance.put(
        `/organization/invoices/${invoiceId}/approve`,
        {},
        {
          validateStatus: function (status) {
            return status >= 200 && status < 600;
          },
        }
      );

      if (response.status === 200) {
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;
        throw new Error(
          data?.message || "Invalid request. Please check the parameters."
        );
      } else if (response.status === 404) {
        throw new Error("Invoice not found.");
      } else if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error("Failed to approve invoice.");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 401) {
          throw new Error("Unauthorized. Please check your authentication.");
        } else if (status === 403) {
          throw new Error(
            "Forbidden. You do not have permission to approve this invoice."
          );
        } else {
          throw new Error(data?.message || "Failed to approve invoice.");
        }
      } else {
        throw new Error("Network error. Please check your connection.");
      }
    }
  }, []);

  const resolveInvoice = useCallback(async (invoiceId) => {
    try {
      const response = await axiosInstance.put(
        `/organization/invoices/${invoiceId}/resolve`,
        {},
        {
          validateStatus: function (status) {
            return status >= 200 && status < 600;
          },
        }
      );

      if (response.status === 200) {
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;
        throw new Error(
          data?.message || "Invalid request. Please check the parameters."
        );
      } else if (response.status === 404) {
        throw new Error("Invoice not found.");
      } else if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error("Failed to approve invoice.");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 403) {
          throw new Error(
            "Forbidden. You do not have permission to resolve this invoice."
          );
        } else {
          throw new Error(data?.message || "Failed to resolve invoice.");
        }
      } else {
        throw new Error("Network error. Please check your connection.");
      }
    }
  }, []);

  const editInvoice = useCallback(async (invoiceId, payload) => {
    try {
      // Transform the payload to the new format
      const transformedPayload = {
        extra_amounts: [
          // Transform additions
          ...payload.additions.map((addition) => ({
            extra_amount_id: addition.extra_amount_id || null,
            amount: addition.amount,
            is_percent: addition.is_percent,
          })),
          // Transform deductions (with positive amounts)
          ...payload.deductions.map((deduction) => ({
            extra_amount_id: deduction.extra_amount_id || null,
            amount: Math.abs(deduction.amount), // Keep deductions positive
            is_percent: deduction.is_percent,
          })),
        ],
      };

      const response = await axiosInstance.put(
        `/organization/invoices/${invoiceId}`,
        transformedPayload,
        {
          validateStatus: function (status) {
            return status >= 200 && status < 600;
          },
        }
      );

      if (response.status === 200) {
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;
        // Return error object with field errors for 400
        return {
          error: true,
          status: 400,
          message:
            data?.message || "Invalid request. Please check the parameters.",
          fieldErrors: data?.response?.errors || data?.errors || {},
        };
      } else if (response.status === 422) {
        const { data } = response;
        // Return error object for 422 (validation errors)
        return {
          error: true,
          status: 422,
          message:
            data?.message || "Validation failed. Please check your input.",
          fieldErrors: data?.response?.errors || data?.errors || {},
        };
      } else if (response.status === 404) {
        throw new Error("Invoice not found.");
      } else if (response.status === 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error("Failed to update invoice.");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 401) {
          throw new Error("Unauthorized. Please check your authentication.");
        } else if (status === 403) {
          throw new Error(
            "Forbidden. You do not have permission to update this invoice."
          );
        } else {
          throw new Error(data?.message || "Failed to update invoice.");
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
      const response = await axiosInstance.get(
        `/organization/payments/${invoiceId}`,
        {
          validateStatus: function (status) {
            return status >= 200 && status < 600;
          },
        }
      );

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
          `/organization/payments/${invoiceId}`,
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

  // Create invoice from existing invoice
  const createInvoiceFromExisting = useCallback(async (invoiceId) => {
    setCreatingInvoice(true);
    setCreateInvoiceError(null);

    try {
      const response = await axiosInstance.put(
        `/organization/invoices/${invoiceId}/create`,
        {},
        {
          validateStatus: function (status) {
            return status >= 200 && status < 600;
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        return response.data;
      } else if (response.status === 400) {
        const { data } = response;
        setCreateInvoiceError(
          data?.message || "Invalid request. Please check the parameters."
        );
        return {
          error: true,
          status: 400,
          message:
            data?.message || "Invalid request. Please check the parameters.",
        };
      } else if (response.status === 422) {
        const { data } = response;
        setCreateInvoiceError(
          data?.message || "Validation failed. Please check your input."
        );
        return {
          error: true,
          status: 422,
          message:
            data?.message || "Validation failed. Please check your input.",
        };
      } else if (response.status === 404) {
        setCreateInvoiceError("Invoice not found.");
        throw new Error("Invoice not found.");
      } else if (response.status === 500) {
        setCreateInvoiceError("Server error. Please try again later.");
        throw new Error("Server error. Please try again later.");
      } else {
        setCreateInvoiceError("Failed to create invoice.");
        throw new Error("Failed to create invoice.");
      }
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;

        if (status === 401) {
          setCreateInvoiceError(
            "Unauthorized. Please check your authentication."
          );
          throw new Error("Unauthorized. Please check your authentication.");
        } else if (status === 403) {
          setCreateInvoiceError(
            "Forbidden. You do not have permission to create invoices."
          );
          throw new Error(
            "Forbidden. You do not have permission to create invoices."
          );
        } else {
          setCreateInvoiceError(data?.message || "Failed to create invoice.");
          throw new Error(data?.message || "Failed to create invoice.");
        }
      } else {
        setCreateInvoiceError("Network error. Please check your connection.");
        throw new Error("Network error. Please check your connection.");
      }
    } finally {
      setCreatingInvoice(false);
    }
  }, []);

  const handleVoidInvoice = useCallback(async (invoiceId) => {
    setVoidingInvoice(true);
    setError(null);
    try {
      const result = await axiosInstance.put(
        `/organization/invoices/${invoiceId}/void`
      );
      if (result.status === 200) {
        const updatedData = await getEmployeeInvoice(cycleId, employeeId);
        setInvoiceData(updatedData);
        getInvoiceHistory(invoiceId);
        enqueueSnackbar("Invoice voided successfully.", {
          variant: "success",
          action: (snackbarId) =>
            getNotificationActions(snackbarId, closeSnackbar),
        });
      } else if (result.status === 400) {
        enqueueSnackbar(result.response.data.message, {
          variant: "error",
          action: (snackbarId) =>
            getNotificationActions(snackbarId, closeSnackbar),
        });
      } else {
        setError("Failed to void invoice. Please try again.");
      }
    } catch (err) {
      console.error("Error voiding invoice:", err);
      setError("Failed to void invoice. Please try again.");
      throw err;
    } finally {
      setVoidingInvoice(false);
    }
  }, []);

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
        `/organization/employees/${invoiceId}/bank-details`,
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
        `/organization/invoice-history/${invoiceId}`,
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

  return {
    createInvoice,
    createInvoiceFromExisting,
    getCycleBreakdown,
    getCycleOverview,
    getInvoices,
    getEmployeeInvoiceList,
    getEmployeeInvoice,
    approveInvoice,
    editInvoice,
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
    createInvoiceError,
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
    resolveInvoice,
    monthFilter,
    setMonthFilter,
    payDocRef,
    completeCycle,
    invoiceLoading,
    handleVoidInvoice,
    voidingInvoice,
    setInvoiceData,
    invoiceData,
  };
}
