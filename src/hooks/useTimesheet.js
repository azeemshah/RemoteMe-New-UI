import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../services/axiosService";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useNavigate } from "react-router-dom";
import { debounce } from "../helpers";

export const useTimesheet = () => {
  const [list, setList] = useState([]);
  const [detail, setDetail] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [timesheetDetails, setTimesheetDetails] = useState([]);
  dayjs.extend(utc);

  const navigate = useNavigate();

  const getAllTimeSheets = async (pageNo, query = "") => {
    setLoading(true);
    try {
      const result = await axiosInstance.get(
        `/employee-timesheets?page=${pageNo}&search=${query}&limit=${limit}`
      );
      if (result.status === 200) {
        setList(result.data.timesheet);
        setStatuses(result.data.statuses);
        setTotalPages(result.data.totalPages);
      } else {
        console.error("Failed to fetch timesheet:");
      }
    } catch (error) {
      console.error("Error fetching timesheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSingleTimesheet = async (id) => {
    setLoading(true);
    try {
      const result = await axiosInstance.get(`/employee/timesheets/${id}`);
      if (result.status === 200) {
        setDetail(result.data.timesheet);

        const tsDetails = {};
        const tsList = [];
        result.data.details.forEach((detail) => {
          let item = {
            hours: detail.hours,
            task_title: detail.task_title,
            task_description: detail.task_description,
          };
          tsDetails[dayjs(detail.date).format("YYYY-MM-DD")] = item;
          tsList.push({
            ...item,
            day: dayjs(detail.date).format("YYYY-MM-DD"),
          });
        });
        setTimesheetDetails(tsList);
        prepareDayList(result.data.timesheet.start_date, tsDetails);
      } else {
        console.error("Failed to fetch timesheet details");
      }
    } catch (error) {
      console.error("Error fetching timesheet details:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start, end, breakHrs, index) => {
    if (!start || !end) return "00:00";

    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);

    let totalMinutes =
      endH * 60 + endM - (startH * 60 + startM) - breakHrs * 60;

    // if (totalMinutes < 0) {
    //   setFieldErrors((prev) => ({
    //     ...prev,
    //     [`end_time.${index}`]: "End time must be after Start time.",
    //   }));
    // } else {
    //   setFieldErrors((prev) => ({
    //     ...prev,
    //     [`end_time.${index}`]: null,
    //   }));
    // }

    let hh = Math.floor(totalMinutes / 60);
    let mm = totalMinutes % 60;

    if (hh < 0 || mm < 0) {
      setFieldErrors((prev) => ({
        ...prev,
        [`end_time.${index}`]: "Please adjust start time, end time, or break.",
      }));
    }

    const hrs = String(hh).padStart(2, "0");
    const mins = String(mm).padStart(2, "0");

    return `${hrs}:${mins}`;
  };

  const handlePagechange = (page) => {
    setCurrentPage(page);
    getAllTimeSheets(page, searchTerm);
  };

  const prepareDayList = (startDate, details) => {
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = dayjs.utc(startDate).add(i, "day");
      days.push(date);
    }

    setRows(
      days.map((day) => {
        let date = day.format("YYYY-MM-DD");
        const formattedDay = dayjs(day).format("ddd DD-MM-YYYY");
        // const isWeekend = formattedDay.startsWith("Sat") || formattedDay.startsWith("Sun");

        if (details[date]) {
          return {
            day: date,
            date: formattedDay,
            hours: details[date].hours,
            task_title: details[date].task_title,
            task_description: details[date].task_description,
            error: false,
            checked: true,
          };
        } else {
          return {
            day: date,
            date: formattedDay,
            hours: "",
            task_title: "",
            task_description: "",
            error: false,
            checked: true, //isWeekend ? false : true,
          };
        }
      })
    );
  };

  const toggleRowChecked = (index, checked) => {
    setRows((prev) => {
      const updatedRows = [...prev];
      updatedRows[index].checked = checked;
      return updatedRows;
    });
  };

  const debouncedSearch = useCallback(
    debounce((q) => {
      setCurrentPage(1);
      getAllTimeSheets(1, q);
    }, 500),
    [limit]
  );

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchTerm(q);
    debouncedSearch(q);
  };

  const submitTimesheet = async (timesheetRows, status) => {
    //  && row.task_title && row.task_description
    const details = timesheetRows
      .filter((row) => row.checked && parseFloat(row.hours) >= 0)
      .map((row) => ({
        date: row.day,
        hours: row.hours,
        task_title: row.task_title || "",
        task_description: row.task_description || "",
      }));

    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const result = await axiosInstance.post(
        `/employee/timesheets/${detail._id}`,
        { details, status }
      );

      if (result.status === 200 || result.status === 201) {
        setError(null);
        navigate(`/employee/timesheet`);
      } else if (result.status === 422) {
        setFieldErrors(result.response.data.errors || {});
      } else if (result.status === 400) {
        setError(
          result.response.data.message ||
            "Please correct the entries and try again."
        );
      } else if (result.status === 404) {
        setError("Invalid timesheet. Please try again.");
      } else {
        setError(
          "Failed to submit timesheet. Please correct entries and try again."
        );
      }
    } catch (error) {
      setError(
        "An error occurred while submitting the timesheet. Please correct entries and try again."
      );
      console.error("Error submitting timesheet:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      if (field === "hours") {
        if (parseFloat(value) <= 0) {
          updated[index]["task_title"] = "No task";
          updated[index]["task_description"] = "No task";
        } else {
          updated[index]["task_title"] =
            updated[index]["task_title"] === "No task"
              ? ""
              : updated[index]["task_title"];
          updated[index]["task_description"] =
            updated[index]["task_description"] === "No task"
              ? ""
              : updated[index]["task_description"];
        }
      }
      return updated;
    });
  };

  const copyToAllRows = () => {
    setRows((prev) => {
      const updated = [...prev];
      const firstRow = updated[0];
      for (let i = 1; i < updated.length; i++) {
        if (
          updated[i].date.startsWith("Sat") ||
          updated[i].date.startsWith("Sun")
        ) {
          continue;
        }

        updated[i] = {
          ...updated[i],
          hours: firstRow.hours,
          task_title: firstRow.task_title,
          task_description: firstRow.task_description,
        };
      }
      return updated;
    });
  };

  useEffect(() => {
    getAllTimeSheets(1, searchTerm);
  }, [limit, searchTerm]);

  return {
    list,
    loading,
    saving,
    currentPage,
    totalPages,
    limit,
    setLimit,
    statuses,
    searchTerm,
    setSearchTerm,
    handlePagechange,
    getSingleTimesheet,
    detail,
    rows,
    submitTimesheet,
    error,
    setError,
    calculateDuration,
    toggleRowChecked,
    fieldErrors,
    setFieldErrors,
    timesheetDetails,
    handleSearch,
    updateRow,
    copyToAllRows,
  };
};
