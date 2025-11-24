import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../services/axiosService";
import { useAuth } from "./useAuth";

export const useAcceptInvite = () => {
  const { login } = useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState({});
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [identificationDocument, setIdentificationDocument] = useState(null);

  const [form, setForm] = useState({
    password: "",
    confirm_password: "",
    cnic: "",
    bank_name: "",
    iban: "",
    swift_code: "",
    bank_phone: "",
    bank_address: "",
    beneficiary_name: "",
    beneficiary_address: "",
  });

  const step1Fields = useMemo(
    () => [
      "password",
      "confirm_password",
      "bank_name",
      "iban",
      "swift_code",
      "bank_phone",
      "bank_address",
      "beneficiary_name",
      "beneficiary_address",
      "identification_document",
    ],
    []
  );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    setIsLoading(true);
    axiosInstance
      .get(`/organization/invite-employee/${token}`)
      .then((result) => {
        if (result.status === 200) {
          setInvitation(result.data.user || {});
          setShowForm(true);
        } else if (result.status === 400) {
          setErrors(result.response.data.errors || {});
          setServerError(result.response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error accepting invite:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: e.target.files[0] || null,
      }));
      return;
    }

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    setForm((prevForm) => {
      const updatedForm = { ...prevForm };

      if (files.length > 0) {
        updatedForm[name] = files[0];
      } else {
        delete updatedForm[name];
      }

      return updatedForm;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (identificationDocument) {
      formData.append("identification_document", identificationDocument);
    }

    axiosInstance
      .post(`/organization/invite-employee/${token}`, formData, {
        headers: {
          "Content-Type": undefined,
        },
      })
      .then((result) => {
        if (result.status === 201) {
          login(result.data.user, result.data.token);
          navigate("/employee");
        } else if (result.status === 400) {
          const errorsFields = Object.keys(result.response.data.errors);
          if (errorsFields.some((field) => step1Fields.includes(field))) {
            setStep(2);
          } else {
            setStep(3);
          }
          setErrors(result.response.data.errors || {});
          setServerError(result.response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error accepting invite:", error);
        setServerError("An error occurred while accepting the invite.");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return {
    token,
    invitation,
    serverError,
    handleSubmit,
    isLoading,
    showForm,
    form,
    handleChange,
    handleFileChange,
    submitting,
    errors,
    step,
    setStep,
    setIdentificationDocument,
    identificationDocument,
  };
};
