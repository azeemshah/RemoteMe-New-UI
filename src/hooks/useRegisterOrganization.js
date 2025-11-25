import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./useAuth";
import axiosInstance from "../services/axiosService";
import { getCurrencies } from "../helpers";

export const useRegisterOrganization = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [invitation, setInvitation] = useState({
    organization_name: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [documents, setDocuments] = useState({});

  const [countryCode, setCountryCode] = useState("us");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { login } = useAuth();
  const navigate = useNavigate();

  const getInvitation = async () => {
    setLoading(true);
    try {
      const result = await axiosInstance.get(
        `/admin/invite-organization/${token}`
      );
      if (result.status === 200) {
        setInvitation({ ...result.data, password: "", about_organization: "" });
        setShowForm(true);
      } else {
        setError(result.response?.data?.message ?? "Something went wrong.");
        setShowForm(false);
      }
    } catch (err) {
      console.error("Invitation fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setInvitation({ ...invitation, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setDocuments((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");

    const form = new FormData();
    form.append("token", token);
    form.append("organization_name", invitation.organization_name);
    form.append("first_name", invitation.first_name);
    form.append("last_name", invitation.last_name);
    form.append("email", invitation.email);
    form.append("password", invitation.password);
    form.append("confirm_password", invitation.confirm_password);
    form.append("about_organization", invitation.about_organization);
    form.append("country_name", selectedCountry?.value ?? "");
    form.append("currency_id", selectedCurrency?.value ?? "");
    form.append("contact_number", phone);

    Object.keys(documents).forEach((key) => {
      if (documents[key]) {
        form.append(key, documents[key]);
      }
    });

    try {
      setLoading(true);
      const result = await axiosInstance.post(
        "/auth/organization-registration",
        form,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );

      if (result.status === 201) {
        login(result.data.user, result.data.token);
        navigate("/organization");
      } else if (result.status === 400 && result.response.data.errors) {
        setErrors(result.response.data.errors);
      } else {
        setServerError(
          result.response?.data?.message || "Something went wrong."
        );
      }
    } catch (err) {
      const { response } = err;
      if (!response) setServerError("Network error. Please try again.");
      else setServerError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getInvitation();
    getCurrencies(setCurrencies);
  }, []);

  const handleCountryChange = (selectedOption) => {
    setCountryCode(selectedOption?.countryCode || "us");
    setSelectedCountry(selectedOption);
  };

  return {
    invitation,
    handleChange,
    handleSubmit,
    selectedCountry,
    handleCountryChange,
    countryCode,
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    phone,
    setPhone,
    loading,
    error,
    errors,
    serverError,
    showForm,
    handleFileChange,
    documents,
  };
};
