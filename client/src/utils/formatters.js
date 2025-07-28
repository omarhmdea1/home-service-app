/**
 * Formatters utility for consistent data presentation across the app
 */

/**
 * Format price in Israeli Shekel (₪) with proper formatting
 * @param {number|string} price - The price value
 * @param {string} unit - Optional unit (e.g., 'per hour', 'per service')
 * @param {boolean} showDecimals - Whether to show decimal places (default: false for whole numbers)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, unit = '', showDecimals = null) => {
  // Handle invalid or missing prices
  if (price === null || price === undefined || price === '' || isNaN(price)) {
    return 'Price TBD';
  }

  const numPrice = parseFloat(price);
  
  // Auto-detect if we should show decimals
  if (showDecimals === null) {
    showDecimals = numPrice % 1 !== 0; // Show decimals only if not a whole number
  }
  
  // Format the number
  const formattedNumber = showDecimals 
    ? numPrice.toFixed(2)
    : Math.round(numPrice).toString();

  // Add thousand separators for large numbers
  const withSeparators = formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Build the final string
  let result = `₪${withSeparators}`;
  
  if (unit && unit.trim()) {
    result += ` ${unit.trim()}`;
  }
  
  return result;
};

/**
 * Format price for display in cards and lists (shorter format)
 * @param {number|string} price - The price value
 * @param {string} unit - Optional unit
 * @returns {string} Formatted price string
 */
export const formatPriceShort = (price, unit = '') => {
  return formatPrice(price, unit, false);
};

/**
 * Format price with full details (longer format)
 * @param {number|string} price - The price value
 * @param {string} unit - Optional unit
 * @returns {string} Formatted price string with decimals when needed
 */
export const formatPriceDetailed = (price, unit = '') => {
  return formatPrice(price, unit, true);
};

/**
 * Format currency without unit (for calculations display)
 * @param {number|string} amount - The amount value
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showDecimals = false) => {
  return formatPrice(amount, '', showDecimals);
};

/**
 * Parse price from formatted string back to number
 * @param {string} formattedPrice - The formatted price string
 * @returns {number} Numeric price value
 */
export const parsePrice = (formattedPrice) => {
  if (!formattedPrice || typeof formattedPrice !== 'string') {
    return 0;
  }
  
  // Remove currency symbol, commas, and unit text
  const numericString = formattedPrice
    .replace(/₪/g, '')
    .replace(/,/g, '')
    .replace(/[a-zA-Z\s]+/g, '')
    .trim();
    
  return parseFloat(numericString) || 0;
};

/**
 * Format percentage
 * @param {number} value - The percentage value (0-100)
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Format date in a user-friendly way
 * @param {Date|string} date - The date to format
 * @param {string} format - Format type: 'short', 'long', 'time'
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return 'Date TBD';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  const now = new Date();
  const options = {
    timeZone: 'Asia/Jerusalem', // Israel timezone
  };
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IL', {
        ...options,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    case 'long':
      return dateObj.toLocaleDateString('en-IL', {
        ...options,
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-IL', {
        ...options,
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return dateObj.toLocaleDateString('en-IL', options);
  }
};

/**
 * Format time duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m", "45m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  
  return `${mins}m`;
}; 