import { useState, useEffect } from "react";
import axiosInstance from "../services/axiosService";
import { getCurrencies } from "../helpers";

const useAdminSetting = () => {
  const [form, setForm] = useState({
    legal_name: "",
    payment_term: 30,
    currency_id: "",
    bank_name: "",
    iban: "",
    swift_code: "",
    bank_phone: "",
    bank_address: "",
    beneficiary_name: "",
    beneficiary_address: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  const get = async () => {
    setLoading(true);
    const currencyOptions = await getCurrencies();
    setCurrencies(currencyOptions);

    try {
      const res = await axiosInstance.get("/admin/settings");
      if (res.status === 200) {
        setForm(res.data);
        const curr = currencyOptions.find(
          (c) => c.value === res.data.currency_id
        );
        setSelectedCurrency(curr || null);
      } else {
        setServerError("Failed to load settings");
      }
    } catch (err) {
      setErrors(err.response.data.errors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get();
  }, []);

  useEffect(() => {
    if (selectedCurrency) {
      setForm((prev) => ({ ...prev, currency: selectedCurrency.value }));
    }
  }, [selectedCurrency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError("");
    setSuccessMessage("");

    const formData = {
      legal_name: form.legal_name,
      payment_term: parseInt(form.payment_term),
      currency_id: selectedCurrency ? selectedCurrency.value : "",
      bank_name: form.bank_name,
      iban: form.iban,
      swift_code: form.swift_code,
      bank_phone: form.bank_phone,
      bank_address: form.bank_address,
      beneficiary_name: form.beneficiary_name,
      beneficiary_address: form.beneficiary_address,
    };

    try {
      const res = await axiosInstance.put("/admin/settings", formData);
      if (res.status === 200) {
        setSuccessMessage("Settings updated successfully");
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      }
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
      setServerError(
        err.response?.data?.message || "Failed to update settings"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    get,
    form,
    loading,
    setForm,
    errors,
    serverError,
    handleChange,
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    handleSubmit,
    successMessage,
  };
};

export default useAdminSetting;
