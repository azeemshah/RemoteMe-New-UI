import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosService";
import { getCurrencies } from "../helpers";
import { countryOptions } from "../config";

export const useOrgInfo = (approved = false) => {
  const [orgInfo, setOrgInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [currencies, setCurrencies] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [documents, setDocuments] = useState({});
  const [form, setForm] = useState({
    organization_name: "",
    about_organization: "",
    country_name: "",
    currency_id: "",
  });
  const [orgDocuments, setOrgDocuments] = useState([]);

  const fetchOrgInfo = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/organization/info");
      setOrgInfo(response.data);
      setForm({
        organization_name: response.data.organization.organization_name || "",
        about_organization: response.data.organization.about_organization || "",
        country_name: response.data.organization.country_name || "",
        currency_id: response.data.organization.currency_id._id || "",
      });
      setOrgDocuments(response.data.documents || []);

      let country = countryOptions.find(
        (c) => c.value === response.data.organization.country_name
      );
      setSelectedCountry(country);
    } catch (err) {
      setServerError("An error occurred while fetching organization info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgInfo();
    getCurrencies(setCurrencies);
  }, []);

  useEffect(() => {
    if (currencies.length > 0) {
      let currency = currencies.find((c) => c.value === form.currency_id);
      setSelectedCurrency(currency);
    }
  }, [currencies, form.currency_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleCountryChange = (opt) => {
    setSelectedCountry(opt);
    setForm((prev) => ({
      ...prev,
      country_name: opt.value,
    }));
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

    setServerError("");
    setErrors({});
    setSuccessMessage("");
    const formData = new FormData();
    formData.append("organization_name", form.organization_name);
    formData.append("about_organization", form.about_organization);
    formData.append("country_name", selectedCountry.value);
    formData.append("currency_id", selectedCurrency.value);
    Object.keys(documents).forEach((key) => {
      if (documents[key]) {
        formData.append(key, documents[key]);
      }
    });

    setLoading(true);
    const endPoint = approved
      ? "/organization/info/update"
      : "/auth/update-organization-info";
    try {
      const res = await axiosInstance.post(endPoint, formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      if (res.status === 200 || res.status === 201) {
        setSuccessMessage("Organization information updated successfully.");
        fetchOrgInfo();
      } else if (res.status === 400) {
        setServerError(
          res.response.data.message || "Failed to update organization info."
        );
        setErrors(res.response.data.errors || {});
      }
    } catch (err) {
      setServerError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return {
    orgInfo,
    loading,
    errors,
    serverError,
    form,
    handleSubmit,
    handleChange,
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    selectedCountry,
    setSelectedCountry,
    handleCountryChange,
    handleFileChange,
    documents,
    orgDocuments,
    successMessage,
  };
};
