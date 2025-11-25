import { useState, useEffect } from "react";
import axiosInstance from "../services/axiosService";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export const useOrganizationTimesheet = () => {
  // — List view state —
  const [list, setList] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [commentClass, setCommentClass] = useState("hide");

  // — Detail view state —
  const [detail, setDetail] = useState(null);
  const [rows, setRows] = useState([]);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState(null);

  // Fetch filtered & paginated list
  const getAllTimesheets = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/organization/timesheets?page=${page}&limit=${limit}&employee=${employeeId}`;
      if (filterStatus) url += `&status=${filterStatus}`;
      const res = await axiosInstance.get(url);

      if (res.status === 200) {
        const arr = res.data.timesheets ?? res.data.timesheet ?? [];
        setList(arr);
        setTotalPages(res.data.totalPages);
        setStatuses([...new Set(arr.map((ts) => ts.status))]);
      }
    } catch (err) {
      console.error("Error fetching organization timesheets:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAllEmployees = async () => {
    try {
      const res = await axiosInstance.get("/organization/employees/list");
      if (res.status === 200) {
        setEmployees(res.data ?? []);
      }
    } catch (err) {
      console.error("Error fetching organization users:", err);
    }
  };

  // Reload list whenever limit or filter changes
  useEffect(() => {
    setCurrentPage(1);
    getAllTimesheets(1);
  }, [limit, filterStatus, employeeId]);

  const handlePagechange = (page) => {
    setCurrentPage(page);
    getAllTimesheets(page);
  };

  const onDateChange = (date) => {
    setStartDate(date);
  };

  // Fetch single timesheet + normalize rows
  const getSingleTimesheet = async (id) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/organization/timesheets/${id}`);
      if (res.status === 200) {
        // 1) Pull core timesheet object
        const ts = res.data.timesheet;
        setDetail({
          _id: ts._id,
          start_date: ts.start_date,
          status: ts.status,
          comment: ts.comment,
        });

        // 2) Build a map of the day‑details
        const rawDetails = res.data.details ?? [];
        const dayMap = {};
        rawDetails.forEach((d) => {
          const key = dayjs(d.date).format("YYYY-MM-DD");
          dayMap[key] = {
            hours: d.hours,
            task_title: d.task_title || "",
            task_description: d.task_description || "",
          };
        });

        // 3) Create a 7‑day sequence from the week’s start date
        const base = ts.start_date;
        const tempRows = [];
        for (let i = 0; i < 7; i++) {
          const dt = dayjs.utc(base).add(i, "day");
          const key = dt.format("YYYY-MM-DD");
          tempRows.push({
            date: dt.format("ddd DD-MMM-YYYY"),
            ...(dayMap[key] ?? {
              hours: "",
              task_title: "",
              task_description: "",
            }),
          });
        }

        setRows(tempRows);
      }
    } catch (err) {
      console.error("Error fetching organization timesheet detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (newStatus) => {
    // clear prior messages
    setComment("");
    setStatusError("");
    setSuccessMessage("");
    setLoading(true);

    const payload = { status: newStatus };
    if (newStatus === "declined") {
      setCommentClass("show");
      payload.comment = comment;
    } else {
      setCommentClass("hide");
    }

    try {
      const res = await axiosInstance.patch(
        `/organization/timesheets/${detail._id}`,
        payload,
        { validateStatus: () => true }
      );

      if (res.status === 200) {
        setSuccessMessage(res.data.message || "Action succeeded");
        await getSingleTimesheet(detail._id);
      } else if (res.status === 400 || res.status === 422) {
        const fieldErrors = res.data.errors || {};
        if (fieldErrors.comment) {
          setCommentError(fieldErrors.comment.join(" "));
        } else {
          setStatusError(res.data.message || `Error ${res.status}`);
        }
      } else {
        setStatusError(res.data.message || `Error ${res.status}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setStatusError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initiateTimesheets = async () => {
    setLoading(true);
    setSuccessMessage("");
    setStatusError("");
    const result = await axiosInstance.post(
      "/organization/timesheets/initiate",
      {
        start_date: dayjs(startDate).format("DD-MM-YYYY"),
      }
    );

    if (result.status === 201) {
      setSuccessMessage(
        result.data.message || "Timesheets initiated successfully"
      );
      setStartDate(null);
      getAllTimesheets(currentPage);
    } else if (result.status === 400 || result.status === 422) {
      setStatusError(
        result.response.data.message || "Failed to initiate timesheets"
      );
    }

    setLoading(false);
  };

  return {
    // List view
    list,
    statuses,
    filterStatus,
    setFilterStatus,
    limit,
    setLimit,
    currentPage,
    totalPages,
    loading,
    handlePagechange,

    // Detail view
    detail,
    rows,
    comment,
    setComment,
    commentError,
    statusError,
    successMessage,
    getSingleTimesheet,
    handleAction,
    commentClass,
    getAllEmployees,
    employees,
    employeeId,
    setEmployeeId,
    onDateChange,
    startDate,
    initiateTimesheets,
  };
};
