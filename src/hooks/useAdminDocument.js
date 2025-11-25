import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosService";
import { debounce } from "../helpers";
import { useNavigate, useParams } from "react-router-dom";
import { ADMIN_ROUTES } from "../config/routes";

const useAdminDocument = () => {
  const [showModal, setShowModal] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    id: null,
    title: "",
    documentFor: "",
    document: null,
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
  const { id } = useParams();

  // --- Fetch paginated list ---
  const getAllDocuments = async (page = 1, query = "") => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        `/admin/documents?page=${page}&limit=${limit}&search=${encodeURIComponent(
          query
        )}`
      );
      if (res.status === 200) {
        setDocuments(res.data.documents);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Debounced search ---
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

  // --- On mount & when limit changes ---
  useEffect(() => {
    getAllDocuments(1, searchTerm);
  }, [limit]);

  // --- Load single document into form when editing ---
  const getDocument = async (docId) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/admin/documents/${docId}`);
      if (res.status === 200) {
        setDocumentForm({
          id: res.data._id,
          title: res.data.title,
          documentFor: res.data.document_for,
          document: null, // file input left blank
        });
        setCurrentDocument(res.data.document);
      }
    } catch (err) {
      console.error("Error loading document:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) getDocument(id);
  }, [id]);

  // --- Form handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    setDocumentForm((prev) => ({ ...prev, document: e.target.files[0] }));
  };

  // --- Create ---
  const createDocument = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const formData = new FormData();
    formData.append("title", documentForm.title);
    formData.append("document_for", documentForm.documentFor);
    formData.append("document", documentForm.document);
    try {
      const res = await axiosInstance.post("/admin/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.status === 201) {
        await getAllDocuments(1, searchTerm);
        navigate(ADMIN_ROUTES.DOCUMENTS);
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else {
        console.error("Unexpected create status:", res.status);
      }
    } catch (err) {
      console.error("Error creating document:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Update ---
  const updateDocument = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const formData = new FormData();
    formData.append("title", documentForm.title);
    formData.append("document_for", documentForm.documentFor);
    if (documentForm.document) {
      formData.append("document", documentForm.document);
    }
    try {
      const res = await axiosInstance.patch(
        `/admin/documents/${documentForm.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.status === 200) {
        await getAllDocuments(currentPage, searchTerm);
        navigate(ADMIN_ROUTES.DOCUMENTS);
      } else if (res.status === 400) {
        setErrors(res.response.data.errors || {});
      } else {
        console.error("Unexpected update status:", res.status);
      }
    } catch (err) {
      console.error("Error updating document:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Toggle status & re-fetch ---
  const toggleDocumentStatus = async (docId, currentStatus) => {
    setLoading(true);
    try {
      const res = await axiosInstance.patch(
        `/admin/documents/${docId}/toggle-status`
      );
      if (res.status === 200) {
        await getAllDocuments(currentPage, searchTerm);
      } else {
        console.error("Failed to toggle status:", res.status);
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination ---
  const handlePagechange = (page) => {
    setCurrentPage(page);
    getAllDocuments(page, searchTerm);
  };

  return {
    showModal,
    setShowModal,
    documentForm,
    setDocumentForm,
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

export default useAdminDocument;
