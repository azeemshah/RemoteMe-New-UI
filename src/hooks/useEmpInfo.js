import { useEffect, useState } from "react";
import axiosInstance from "../services/axiosService";

export const useEmpInfo = () => {
  const [empInfo, setEmpInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [userAdminDocuments, setUserAdminDocuments] = useState({});
  const [userOrgDocuments, setUserOrgDocuments] = useState({});
  const [userContractDocuments, setUserContractDocuments] = useState({});
  const [adminDocuments, setAdminDocuments] = useState([]);
  const [orgDocuments, setOrgDocuments] = useState([]);
  const [contractDocuments, setContractDocuments] = useState([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    contact_number: "",
    admin_comments: "",
  });

  const fetchEmpInfo = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/employee/info");
      setEmpInfo(response.data);
      setForm({
        first_name: response.data.employee.first_name || "",
        last_name: response.data.employee.last_name || "",
        contact_number: response.data.employee.contact_number || "",
        contract_signed_document: response.data.contract_signed_document || "",
        admin_comments: response.data.employee.admin_comments || "",
      });

      setAdminDocuments(response.data.empAdminDocuments || []);
      setOrgDocuments(response.data.empOrgDocuments || []);
      setContractDocuments(response.data.contractDocuments || []);
    } catch (err) {
      setServerError("An error occurred while fetching organization info.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpInfo();
  }, []);

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

  const handleAdminFileChange = (e) => {
    const { name, files } = e.target;
    setUserAdminDocuments((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  const handleOrgFileChange = (e) => {
    const { name, files } = e.target;
    setUserOrgDocuments((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  const handleContractFileChange = (e) => {
    const { name, files } = e.target;
    setUserContractDocuments((prev) => ({
      ...prev,
      [name]: files[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("first_name", form.first_name);
    formData.append("last_name", form.last_name);
    formData.append("contact_number", form.contact_number);
    if (form.contract_document) {
      formData.append("contract_document", form.contract_document);
    }

    Object.keys(userAdminDocuments).forEach((key) => {
      if (userAdminDocuments[key]) {
        formData.append(key, userAdminDocuments[key]);
      }
    });

    Object.keys(userOrgDocuments).forEach((key) => {
      if (userOrgDocuments[key]) {
        formData.append(key, userOrgDocuments[key]);
      }
    });

    Object.keys(userContractDocuments).forEach((key) => {
      if (userContractDocuments[key]) {
        formData.append(key, userContractDocuments[key]);
      }
    });

    setLoading(true);
    try {
      const res = await axiosInstance.post("/employee/update", formData, {
        headers: {
          "Content-Type": undefined, // Let axios set the content type
        },
      });

      if (res.status === 200 || res.status === 201) {
        setSuccessMessage("Employee information updated successfully.");
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      }
    } catch (err) {
      setServerError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return {
    empInfo,
    loading,
    errors,
    serverError,
    form,
    handleSubmit,
    handleChange,
    handleAdminFileChange,
    handleOrgFileChange,
    adminDocuments,
    orgDocuments,
    contractDocuments,
    successMessage,
    handleContractFileChange,
  };
};
