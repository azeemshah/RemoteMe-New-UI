import { useEffect, useRef, useState } from "react";
import axiosInstance from "../services/axiosService";

const useOrgInvite = () => {
  const [form, setForm] = useState({
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    documents: [],
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkInviteLoading, setBulkInviteLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [entriesError, setEntriesError] = useState([]);

  const csvFileRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDocumentSelect = (e, docId) => {
    const selectedDocuments = e.target.checked
      ? [...form.documents, docId]
      : form.documents.filter((id) => id !== docId);
    setForm({ ...form, documents: selectedDocuments });
  };

  const getAllDocuments = async () => {
    try {
      const response = await axiosInstance.get(
        "/admin/get-all-organization-documents"
      );
      if (response.status === 200) {
        setDocuments(response.data);
      } else {
        console.error("Failed to fetch documents:", response);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  };

  useEffect(() => {
    getAllDocuments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setSuccessMessage("");

    try {
      setLoading(true);
      const result = await axiosInstance.post(
        "/admin/invite-organization",
        form
      );

      if (result.status === 201) {
        setSuccessMessage(result.data.message);
        setForm({
          organizationName: "",
          firstName: "",
          lastName: "",
          email: "",
          documents: [],
        });
      } else if (
        result.response.status === 400 &&
        result.response.data.errors
      ) {
        setErrors(result.response.data.errors);
      } else if (result.response.status === 409) {
        setServerError(result.response.data.message);
      } else {
        setServerError("Something went wrong.");
      }
    } catch (error) {
      const { response } = error;
      if (!response) {
        setServerError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitBulkInvite = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const files = csvFileRef.current.files;

    if (files.length > 0) {
      formData.append("csv_file", files[0]);
    }

    try {
      setBulkInviteLoading(true);
      setEntriesError([]);
      setErrors({});
      const response = await axiosInstance.post(
        "/admin/bulk-invite",
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        csvFileRef.current.value = "";
        if (response.data?.totalProcessed === 0) {
          setErrors({ csv_file: ["No valid entries found in the CSV file."] });
        } else {
          setEntriesError(response.data.results);
        }
      } else if (response.status === 400) {
        setErrors(response.response.data.errors);
      }
    } catch (error) {
      const { response } = error;
      console.log(error);
      if (!response) {
        setServerError("Network error. Please try again.");
      }
    } finally {
      setBulkInviteLoading(false);
    }
  };

  return {
    form,
    errors,
    serverError,
    successMessage,
    loading,
    handleChange,
    handleSubmit,
    submitBulkInvite,
    documents,
    handleDocumentSelect,
    csvFileRef,
    bulkInviteLoading,
    entriesError,
  };
};

export default useOrgInvite;
