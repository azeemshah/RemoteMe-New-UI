import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";
import { useNavigate, useParams } from "react-router-dom";

const useOrganizationDocument = () => {
  const [documentForm, setDocumentForm] = useState({
    id: null,
    title: "",
    document: null, // just the file
  });
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams(); // for edit

  // Fetch paginated list
  const getAllDocuments = async (page = 1, query = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/organization/documents?page=${page}&limit=${limit}&search=${encodeURIComponent(
          query
        )}`
      );
      if (res.status === 200) {
        setDocuments(res.data.documents);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching org‑docs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      getAllDocuments(1, q);
    }, 500),
    [limit]
  );
  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchTerm(q);
    debouncedSearch(q);
  };

  // Reload whenever limit changes
  useEffect(() => {
    getAllDocuments(currentPage, searchTerm);
  }, [limit]);

  // Load single doc for edit
  const getDocument = async (docId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/organization/documents/${docId}`);
      if (res.status === 200) {
        setDocumentForm({
          id: res.data._id,
          title: res.data.title,
          document: null, // user must re‑upload if changing
        });
        setCurrentDocument(res.data.document);
      }
    } catch (err) {
      console.error("Error loading org doc:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) getDocument(id);
  }, [id]);

  // Form handlers
  const handleInputChange = (e) => {
    setDocumentForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleFileChange = (e) => {
    setDocumentForm((prev) => ({
      ...prev,
      document: e.target.files[0],
    }));
  };

  // Create
  const createDocument = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const fd = new FormData();
    fd.append("title", documentForm.title);
    fd.append("document", documentForm.document);
    try {
      const res = await axiosInstance.post("/organization/documents", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 201) {
        await getAllDocuments(1, searchTerm);
        navigate("/organization/documents");
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else {
        console.error("Unexpected create status:", res.status);
      }
    } catch (err) {
      console.error("Error creating org‑doc:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update
  const updateDocument = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const fd = new FormData();
    fd.append("title", documentForm.title);
    if (documentForm.document) {
      fd.append("document", documentForm.document);
    }
    try {
      const res = await axiosInstance.patch(
        `/organization/documents/${documentForm.id}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.status === 200) {
        await getAllDocuments(currentPage, searchTerm);
        navigate("/organization/documents");
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else {
        console.error("Unexpected update status:", res.status);
      }
    } catch (err) {
      console.error("Error updating org‑doc:", err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle status
  const toggleDocumentStatus = async (docId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch(
        `/organization/documents/${docId}/toggle-status`
      );
      if (res.status === 200) {
        await getAllDocuments(currentPage, searchTerm);
      } else {
        console.error("Failed to toggle status:", res.status);
      }
    } catch (err) {
      console.error("Error toggling org‑doc status:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const handlePagechange = (page) => {
    setCurrentPage(page);
    getAllDocuments(page, searchTerm);
  };

  return {
    documentForm,
    handleInputChange,
    handleFileChange,
    createDocument,
    updateDocument,
    getDocument,
    documents,
    loading,
    errors,
    searchTerm,
    handleSearch,
    limit,
    setLimit,
    currentPage,
    totalPages,
    handlePagechange,
    toggleDocumentStatus,
    currentDocument,
  };
};

export default useOrganizationDocument;
