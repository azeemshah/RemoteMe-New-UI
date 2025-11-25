import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";
import { useNavigate } from "react-router-dom";
import { ORG_ROUTES } from "../config/routes";

const useEmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);

  const navigate = useNavigate();

  // detail & edit state
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [formData, setFormData] = useState({ benefits_ids: [] });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [resendingId, setResendingId] = useState(null);

  // lists
  const [allBenefitsList, setAllBenefitsList] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // helper: currency picker
  const onCurrencyChange = (opt) => {
    setSelectedCurrency(opt);
    setFormData((prev) => ({ ...prev, currency_id: opt.value }));
  };

  // 1) Load employee list
  const load = async (page = 1, query = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/organization/employees?page=${page}&search=${encodeURIComponent(
          query
        )}&limit=${limit}`
      );
      if (res.status === 200) {
        setEmployees(res.data.employees);
        setTotalPages(res.data.totalPages);
      }
    } catch (e) {
      console.error("Failed to load employees", e);
    } finally {
      setLoading(false);
    }
  };

  // 2) Load all benefits once
  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get("/get-all-benefits");
        if (res.status === 200) setAllBenefitsList(res.data);
      } catch (e) {
        console.error("Failed to load benefits", e);
      }
    })();
  }, []);

  useEffect(() => {}, []);

  // 3) Debounced search
  const debounced = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      load(1, q);
    }, 500),
    [limit]
  );
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    debounced(e.target.value);
  };

  // 4) Page change
  const changePage = (pg) => {
    setCurrentPage(pg);
    load(pg, searchTerm);
  };

  // 5) Toggle active/inactive status
  const toggleStatus = async (id) => {
    setLoading(true);
    try {
      await axiosInstance.patch(`/organization/employees/${id}`);
      await load(currentPage, searchTerm);
    } catch (e) {
      console.error("Failed to toggle status", e);
    } finally {
      setLoading(false);
    }
  };

  // 6) Toggle account_status with optional comment
  const toggleAccountStatus = async (id, newStatus, comment = "") => {
    setLoading(true);
    try {
      const payload = { status: newStatus };
      if (newStatus === "declined" && comment.trim()) {
        payload.comment = comment;
      }
      await axiosInstance.patch(
        `/organization/employees/${id}/account-status`,
        payload
      );
      // refresh detail & list
      await openDetails(id);
      await load(currentPage, searchTerm);
      return { success: true };
    } catch (e) {
      console.error("Failed to toggle account status", e);
      return {
        success: false,
        message: e.response?.data?.message || e.message || "Network error",
      };
    } finally {
      setLoading(false);
    }
  };

  // 7) Open details for editing
  const openDetails = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/organization/employees/${id}`);
      if (res.status === 200) {
        const ud = res.data;
        setSelectedEmp(ud);
        setFormData({
          country_of_employment: ud.country_of_employment || "",
          employment_type: ud.employment_type || "",
          salary: ud.salary ?? "",
          benefits_ids: (ud.benefits || []).map((b) => b.id ?? b._id),
          job_title: ud.job_title || "",
          project_name: ud.project_name || "",
          cnic: ud.cnic || "",
          identification_document: ud.identification_document || "",
          job_description: ud.job_description || "",
          contract_start_date: ud.contract_start_date?.split("T")[0] || "",
          contract_end_date: ud.contract_end_date?.split("T")[0] || "",
          holidays: ud.holidays || "",
          reporting_manager: ud.reporting_manager || "",
          annual_bonus: ud.annual_bonus ?? "",
          annual_vacation: ud.annual_vacation ?? "",
          contract_duration: ud.contract_duration || "",
          notice_period: ud.notice_period ?? "",
          bank_name: ud.bank_name || "",
          iban: ud.iban || "",
          swift_code: ud.swift_code || "",
          bank_phone: ud.bank_phone || "",
          bank_address: ud.bank_address || "",
          beneficiary_name: ud.beneficiary_name || "",
          beneficiary_address: ud.beneficiary_address || "",
        });

        if (ud.currency) {
          setSelectedCurrency(ud.currency);
        }
        setFieldErrors({});
        setServerError("");
      }
    } catch (e) {
      console.error("Failed to load employee details", e);
    } finally {
      setLoading(false);
    }
  };

  const resendInvite = async (employeeId) => {
    setResendingId(employeeId);
    setServerError("");
    setSuccessMessage("");
    try {
      const res = await axiosInstance.post(
        `/organization/invite-employee/resend/${employeeId}`
      );
      if (res.status === 201) {
        setSuccessMessage("Invitation resent successfully.");
        await load(currentPage, searchTerm);
      } else if (res.status == 400) {
        setServerError(
          res.response.data.message ||
            "Failed to resend invite. Please try again."
        );
      } else {
        setServerError("Failed to resend invite. Please try again.");
      }
    } catch (e) {
      console.error("Failed to resend invite", e);
      setServerError("Failed to resend invite. Please try again.");
    } finally {
      setResendingId(null);
    }
  };

  // 8) Form change handler
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "number" ? (value === "" ? "" : Number(value)) : value;
    setFormData((fd) => ({ ...fd, [name]: val }));
  };

  // 9) Save edits
  const save = async () => {
    setSaving(true);
    setFieldErrors({});
    setServerError("");
    try {
      const payload = {
        ...formData,
        // currency_id: selectedCurrency?.value
      };
     
      delete payload.identification_document;

      const res = await axiosInstance.put(
        `/organization/employees/${selectedEmp._id}`,
        payload,
        { validateStatus: (s) => s < 500 }
      );
      if (res.status < 300) {
        navigate(ORG_ROUTES.EMPLOYEE_LISTING);
        await load(currentPage, searchTerm);
      } else if (res.status < 500) {
        setFieldErrors(res.data.errors || {});
        setServerError(res.data.message || "");
      } else {
        setServerError("Unexpected server response.");
      }
    } catch (err) {
      console.error("Save failed", err);
      setServerError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // 10) Initial load & on limit change
  useEffect(() => {
    load(1, "");
  }, [limit]);

  return {
    employees,
    loading,
    currentPage,
    totalPages,
    searchTerm,
    handleSearch,
    limit,
    setLimit,
    changePage,
    toggleStatus,
    toggleAccountStatus,
    openDetails,
    selectedEmp,
    formData,
    handleChange,
    save,
    saving,
    fieldErrors,
    serverError,
    allBenefitsList,
    selectedCurrency,
    onCurrencyChange,
    resendInvite,
    resendingId,
    successMessage,
  };
};

export default useEmployeeList;
