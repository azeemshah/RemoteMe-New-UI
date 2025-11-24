import { useState } from "react";
import axiosInstance from "../services/axiosService";

const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError("");
    setSuccessMessage("");

    try {
      setLoading(true);
      const result = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      if (result.status === 400) {
        setErrors(result.response.data.errors);
      } else if (result.status === 200 || result.status === 201) {
        setSuccessMessage(
          result.data.message ||
            "If that email exists, we’ve sent you a reset link."
        );
        setEmail("");
      } else if (result.status === 404) {
        setError(result.response.data.message);
      } else {
        setError("Unexpected response from server. Try again later.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleSubmit,
    successMessage,
    errors,
    error,
    email,
    setEmail,
    loading,
  };
};

export default useForgotPassword;
