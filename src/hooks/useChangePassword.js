import { useState } from "react";
import axiosInstance from "../services/axiosService";

const useChangePassword = () => {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isMatch = form.confirm.length > 0 && form.newPassword === form.confirm;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setSuccessMessage("");

    try {
      setLoading(true);
      const result = await axiosInstance.patch("/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      if (result.status === 400 && result.response?.data?.errors) {
        setErrors(result.response.data.errors);
      } else if (result.status === 200 || result.status === 201) {
        setSuccessMessage(
          result.data.message || "Password changed successfully."
        );
        setForm({ oldPassword: "", newPassword: "", confirm: "" });
      } else if (result.status === 404) {
        setServerError(result.response.data.message);
      } else {
        setServerError("Unexpected response from server. Try again later.");
      }
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
      console.error("Error:", err);
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
    isMatch,
    handleChange,
    handleSubmit,
  };
};

export default useChangePassword;
