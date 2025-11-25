// Utility functions for date handling across the application

/**
 * Format a date string to show only the date part (no time)
 * This prevents timezone issues where cycle_end shows the next day
 * @param {string} dateString - ISO date string
 * @param {object} options - toLocaleDateString options
 * @returns {string} Formatted date string
 */
export const formatDateOnly = (dateString, options = {}) => {
  if (!dateString) return "";

  try {
    // Split the date string to get only the date part (before 'T')
    const datePart = dateString.split("T")[0];
    const date = new Date(datePart + "T00:00:00");

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Format cycle dates for display (start and end dates)
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Formatted date range
 */
export const formatCycleDates = (startDate, endDate) => {
  if (!startDate || !endDate) return "N/A";

  try {
    const start = new Date(startDate.split("T")[0] + "T00:00:00");
    const end = new Date(endDate.split("T")[0] + "T00:00:00");

    const startFormatted = `${start.getDate()}${getOrdinalSuffix(
      start.getDate()
    )} ${start.toLocaleDateString("en-US", { month: "short" })}`;
    const endFormatted = `${end.getDate()}${getOrdinalSuffix(
      end.getDate()
    )} ${end.toLocaleDateString("en-US", { month: "short" })}`;

    return `${startFormatted} to ${endFormatted}`;
  } catch (error) {
    console.error("Error formatting cycle dates:", error);
    return "N/A";
  }
};

/**
 * Get ordinal suffix for day numbers
 * @param {number} day - Day of the month
 * @returns {string} Ordinal suffix
 */
export const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

/**
 * Format date for display in cards and summaries
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return "";

  try {
    const datePart = dateString.split("T")[0];
    const date = new Date(datePart + "T00:00:00");

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting display date:", error);
    return "";
  }
};

/**
 * Get only the date part from a date string (for comparisons)
 * @param {string} dateString - ISO date string
 * @returns {Date} Date object with time set to 00:00:00
 */
export const getDateOnly = (dateString) => {
  if (!dateString) return null;

  try {
    const datePart = dateString.split("T")[0];
    return new Date(datePart + "T00:00:00");
  } catch (error) {
    console.error("Error getting date only:", error);
    return null;
  }
};

/**
 * Format currency amount with 2 decimal places
 * @param {number} amount - The amount to format
 * @param {string} currencySymbol - Currency symbol (default: "$")
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currencySymbol = "$") => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currencySymbol}0.00`;
  }

  const numAmount = parseFloat(amount);
  return `${currencySymbol}${numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format amount with 2 decimal places (without currency symbol)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted amount string
 */
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0.00";
  }

  const numAmount = parseFloat(amount);
  return numAmount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
