import { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import axiosInstance from "../services/axiosService";

const useResetPassword = () => {
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = pathToken || searchParams.get("token") || "";

  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isMatch = confirm.length > 0 && password === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setSuccessMessage("");

    if (!token) {
      setServerError("Reset link is missing or invalid.");
      return;
    }

    // const validation = {};
    // if (!password) validation.password = "New password is required";
    // if (!confirm) validation.confirm = "Please confirm your password";
    // else if (password !== confirm) validation.confirm = "Passwords do not match";

    // if (Object.keys(validation).length) {
    //   setErrors(validation);
    //   return;
    // }

    try {
      setLoading(true);
      const result = await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      if (result.status === 400) {
        setErrors(result.response.data.errors);
      } else if (result.status === 200 || result.status === 201) {
        setSuccessMessage(
          result.data.message || "Your password has been reset successfully."
        );
        navigate("/");
      } else if (result.status === 404) {
        setServerError(
          result.response.data.message || "Reset link is invalid or expired."
        );
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
    password,
    confirm,
    setPassword,
    setConfirm,
    errors,
    serverError,
    successMessage,
    loading,
    isMatch,
    handleSubmit,
  };
};

export default useResetPassword;
