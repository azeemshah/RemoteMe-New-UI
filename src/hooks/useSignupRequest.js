import { useState } from "react";
import axiosInstance from "../services/axiosService";

const useSignupRequest = () => {
  const [form, setForm] = useState({
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    recaptcha_token: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((form) => ({ ...form, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});
    setServerError("");
    setSuccessMessage("");

    const payload = {
      organizationName: form.organizationName,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      recaptcha_token: form.recaptcha_token,
    };

    try {
      setLoading(true);
      const result = await axiosInstance.post(
        "/submit-signup-request",
        payload
      );

      if (result.status === 201 || result.status === 200) {
        setSuccessMessage(
          result.data.message || "Request submitted successfully!"
        );
        setForm({
          organizationName: "",
          firstName: "",
          lastName: "",
          email: "",
        });
      } else if (
        result.response?.status === 400 &&
        result.response.data.errors
      ) {
        setErrors(result.response.data.errors);
      } else if (result.response?.status === 409) {
        setServerError(result.response.data.message);
      } else {
        setServerError("Something went wrong.");
      }
    } catch (error) {
      const { response } = error;
      if (response) {
        if (response.status === 400 && response.data.errors) {
          setErrors(response.data.errors);
        } else if (response.data.message) {
          setServerError(response.data.message);
        } else {
          setServerError(`Error ${response.status}: ${response.statusText}`);
        }
      } else {
        setServerError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    errors,
    serverError,
    successMessage,
    loading,
    setForm,
    handleChange,
    handleSubmit,
  };
};

export default useSignupRequest;
