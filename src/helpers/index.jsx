import axiosInstance from "../services/axiosService";

export const formatOptionLabel = ({ label, countryCode }) => (
  <div className="d-flex align-items-center">
    <span
      className={`fi fi-${countryCode} me-2`}
      style={{ width: "20px" }}
    ></span>
    <span>{label}</span>
  </div>
);

export function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export const getOrganizationsDD = async (setOrganizations) => {
  const res = await axiosInstance.get("/admin/organizations/list");
  if (res.status === 200) {
    setOrganizations(
      res.data.map((org) => ({
        value: org._id,
        label: org.organization_name,
      }))
    );
  }
};

export const getCurrencies = async (setCurrencies = null) => {
  try {
    const result = await axiosInstance.get("/get-currencies-list");
    if (result.status === 200) {
      const currencyOptions = result.data.map((currency) => ({
        value: currency._id,
        label: currency.code,
        countryCode: currency.code2,
        symbol: currency.symbol,
      }));

      if (setCurrencies) {
        setCurrencies(() => currencyOptions);
      } else {
        return currencyOptions;
      }
    }
  } catch (err) {
    console.error("Currency fetch error:", err);
  }
};

export function formatDateToMMDDYYYY(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
}

export const toUpper = (s) => (s ? s.toUpperCase() : "");

export const accountStatusBadge = {
  pending: <span className="badge bg-warning">Pending</span>,
  approved: <span className="badge bg-success">Approved</span>,
  declined: <span className="badge bg-danger">Declined</span>,
};

function toTitleCase(s) {
  if (!s) return '';
  return s
    .toString()
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Safely render a badge from a mapping. If mapping doesn't contain the status
 * it will fall back to a neutral badge showing the status text (title-cased),
 * or a dash when status is empty/null.
 */
export const renderBadge = (mapping, status) => {
  const key = (status || '').toString().toLowerCase().trim();
  if (key && mapping && Object.prototype.hasOwnProperty.call(mapping, key)) {
    return mapping[key];
  }

  if (!key) return <span className="badge bg-secondary">—</span>;

  return <span className="badge bg-secondary">{toTitleCase(status)}</span>;
};

export const invitationStatusBadge = {
  pending: <span className="badge bg-warning">Pending</span>,
  accepted: <span className="badge bg-success">Accepted</span>,
  request: <span className="badge bg-danger">Request</span>,
};

export const loginStatusBadge = {
  active: <span className="badge bg-success">Active</span>,
  inactive: <span className="badge bg-danger">Inactive</span>,
};

export const orgInvoiceStatusBadge = {
  pending: <span className="badge bg-warning">Pending</span>,
  invoiced: <span className="badge bg-info">Invoiced</span>,
  paid: <span className="badge bg-success">Paid</span>,
};

export const orgGeneralInvoiceStatusBadge = {
  invoiced: (
    <span className="badge bg-primary status-badge fw-bold">Invoiced</span>
  ),
  paid: <span className="badge bg-success status-badge fw-bold">Paid</span>,
  voided: <span className="badge bg-danger status-badge fw-bold">Voided</span>,
};

export const userStatusBadge = {
  employee: <span className="badge bg-info">Employee</span>,
  organization: (
    <span className="badge bg-primary text-white">Organization</span>
  ),
  "sub-org-admin": (
    <span className="badge bg-warning text-dark">Sub Org Admin</span>
  ),
};

export const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-warning text-white";
    case "approved":
      return "bg-success text-white";
    case "submitted":
      return "bg-info text-white";
    case "paid":
      return "bg-primary text-white";
    case "partially paid":
      return "bg-secondary text-white";
    case "created":
      return "bg-primary text-white";
    case "flagged":
      return "bg-danger text-white";
    case "declined":
      return "bg-danger text-white";
    case "change requested":
      return "bg-danger text-white";
    case "change-requested":
      return "bg-danger text-white";
    case "resolved":
      return "bg-resolved text-white";
    default:
      return "bg-secondary text-white";
  }
};

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const getNotificationActions = (snackbarId, closeSnackbar) => (
  <button
    className="btn btn-outline-warning btn-sm"
    onClick={() => closeSnackbar(snackbarId)}
  >
    Dismiss
  </button>
);

export const perPageList = [5, 10, 25, 50, 100];
