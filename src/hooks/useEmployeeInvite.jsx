import { useEffect, useMemo, useState } from "react";
import { countryOptions } from "../components/CountrySelect";
import axiosInstance from "../services/axiosService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
// import { formatDateToMMDDYYYY } from "../helpers";
// import { ORG_ROUTES } from "../config/routes";
// import { useNavigate } from "react-router-dom";

const useEmployeeinvite = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  // ─── DEFAULT COUNTRY ──────────────────────────────────────────────────────────
  // Pick "United States" if present, otherwise just use the first option
  const defaultCountry =
    countryOptions.find((c) => c.value === "United States") ||
    countryOptions[0];

  // ─── LOCAL STATE ──────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // 1️⃣ Safe selectedCountry init:
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  // ─── FETCH BENEFITS ────────────────────────────────────────────────────────────
  const [allBenefits, setAllBenefits] = useState([]);
  // ─── COUNTRY & CURRENCY HANDLERS ─────────────────────────────────────────────
  const [selectedCurrency, setSelectedCurrency] = useState({});

  // 2️⃣ formData seeded with a safe country_of_employment:
  const [formData, setFormData] = useState({
    // Basic Details
    first_name: "",
    last_name: "",
    email: "",
    country_of_employment: selectedCountry?.value || "",
    job_title: "",
    project_name: "",
    job_description: "",
    contract_start_date: "",
    contract_end_date: "",
    // Compensation
    employment_type: "full-time",
    currency_id: user.organizations[0]?.currency_id?._id || "",
    salary: "",
    benefits_ids: [],
    holidays: "Company Standard",
    reporting_manager: "",
    contract_duration: "fixed-term",
    annual_bonus: "",
    documents: [{ title: "", file: null }],
  });

  const [foundEmployee, setFoundEmployee] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // ─── STEP ICONS & FIELDS ──────────────────────────────────────────────────────
  const steps = useMemo(
    () => [
      { icon: <i className="bi bi-person-circle"></i>, label: "Basic Details" },
      {
        icon: <i className="bi bi-currency-dollar"></i>,
        label: "Compensation",
      },
      {
        icon: <i className="bi bi-file-earmark-text"></i>,
        label: "Contract Document",
      },
      { icon: <i className="bi bi-shield-lock"></i>, label: "Review" },
    ],
    []
  );

  const step0Fields = useMemo(
    () => [
      "first_name",
      "last_name",
      "email",
      "country_of_employment",
      "job_title",
      "project_name",
      "contract_start_date",
      "contract_end_date",
      "job_description",
    ],
    []
  );
  const step1Fields = useMemo(
    () => [
      "employment_type",
      "contract_duration",
      "salary",
      "currency_id",
      "annual_bonus",
      "benefits_ids",
      "holidays",
      "reporting_manager",
    ],
    []
  );

  const step2Fields = useMemo(() => ["documents"], []);

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const response = await axiosInstance.get("/get-all-benefits");
        if (response.status === 200) {
          setAllBenefits(response.data);
        } else {
          console.error("Failed to fetch benefits");
        }
      } catch (error) {
        console.error("Error fetching benefits:", error);
      }
    };
    fetchBenefits();
  }, []);

  const getUserByEmail = async (email) => {
    if (selectedEmployeeId) return;

    if (!email) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/organization/employees/get-by-email?email=${encodeURIComponent(
          email
        )}`
      );

      if (response.status === 200) {
        setFoundEmployee(response.data);
      }
    } catch (error) {
      console.error("Error fetching user by email:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectEmployee = () => {
    setSelectedEmployeeId(foundEmployee?._id || null);
    setFormData((prev) => ({
      ...prev,
      first_name: foundEmployee?.first_name,
      last_name: foundEmployee?.last_name,
    }));

    setFoundEmployee(null);
  };

  const unSelectEmployee = () => {
    setFoundEmployee(null);
    setSelectedEmployeeId(null);
    setFormData((prev) => ({
      ...prev,
      email: "",
      first_name: "",
      last_name: "",
    }));
  };

  // 3️⃣ Simplified country-change:
  const handleCountryChange = (opt) => {
    setSelectedCountry(opt);
    setFormData((prev) => ({
      ...prev,
      country_of_employment: opt.value,
    }));
  };

  // ─── VALIDATION NAVIGATION ────────────────────────────────────────────────────
  const handleErrorNavigation = (errorFields) => {
    const keys = Object.keys(errorFields);
    if (keys.some((f) => step0Fields.includes(f))) {
      setCurrentStep(0);
    } else if (keys.some((f) => step1Fields.includes(f))) {
      setCurrentStep(1);
    } else if (
      keys.some((f) => step2Fields.includes(f) || f.startsWith("documents"))
    ) {
      setCurrentStep(2);
    }
  };

  // ─── GENERIC FIELD HANDLER ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        benefits_ids: checked
          ? [...prev.benefits_ids, value]
          : prev.benefits_ids.filter((id) => id !== value),
      }));
    } else if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.files[0] ? e.target.files[0] : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ─── Contract Documents ──────────────────────────────────────────────────────────────

  const handleContractDocuments = (e, index) => {
    if (e.target.type === "text") {
      const title = e.target.value;
      setFormData((prev) => {
        const updatedDocuments = [...prev.documents];
        updatedDocuments[index] = { ...updatedDocuments[index], title };
        return { ...prev, documents: updatedDocuments };
      });
      return;
    } else if (e.target.type === "file") {
      setFormData((prev) => {
        const updatedDocuments = [...prev.documents];
        updatedDocuments[index] = {
          ...updatedDocuments[index],
          file: e.target.files[0] || null,
        };
        return { ...prev, documents: updatedDocuments };
      });
    }
  };

  const addDocument = () => {
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, { title: "", file: null }],
    }));
  };

  // ─── STEP CONTROLS ────────────────────────────────────────────────────────────
  const nextStep = () => setCurrentStep((s) => s + 1);
  const prevStep = () => setCurrentStep((s) => s - 1);

  // ─── SUBMIT ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    if (selectedEmployeeId) {
      form.append("employee_id", selectedEmployeeId);
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "documents") {
        if (value.length > 0) {
          value.forEach((doc, index) => {
            form.append(`documents[${index}][file]`, doc.file || null);
            form.append(`documents[${index}][title]`, doc.title);
          });
        }
      } else {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((item, index) => form.append(`${key}[${index}]`, item));
        } else if (value) {
          form.append(key, value);
        }
      }
    });

    try {
      const res = await axiosInstance.post(
        "/organization/invite-employee",
        form,
        {
          headers: {
            "Content-Type": undefined, // Let axios set the correct Content-Type
          },
        }
      );

      if (res.status === 201) {
        setSelectedCountry(defaultCountry);
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          country_of_employment: defaultCountry.value,
          job_title: "",
          project_name: "",
          job_description: "",
          contract_start_date: "",
          contract_end_date: "",
          employment_type: "full-time",
          currency_id: "",
          salary: "",
          benefits_ids: [],
          holidays: "Company Standard",
          reporting_manager: "",
          contract_duration: "fixed-term",
          annual_bonus: "",
          documents: [{ title: "", file: null }],
        });
        setErrors({});
        setServerError("");
        navigate("/organization/invite-success");
      } else if (res.status === 400 && res.response.data.errors) {
        setServerError(res.response.data.message || "Validation error.");
        setErrors(res.response.data.errors);
        handleErrorNavigation(res.response.data.errors);
      } else {
        setServerError(res.response?.data?.message || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setServerError("Network or server error.");
    } finally {
      setLoading(false);
    }
  };

  return {
    steps,
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    handleChange,
    selectedCountry,
    handleCountryChange,
    nextStep,
    prevStep,
    selectedCurrency,
    setSelectedCurrency,
    showPreview,
    setShowPreview,
    handleSubmit,
    allBenefits,
    errors,
    serverError,
    loading,
    addDocument,
    handleContractDocuments,
    getUserByEmail,
    foundEmployee,
    unSelectEmployee,
    selectEmployee,
    selectedEmployeeId,
  };
};

export default useEmployeeinvite;
