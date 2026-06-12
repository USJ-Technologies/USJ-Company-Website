/**
 * Format a number as Indian Rupees (INR)
 * @param {number} amount
 * @returns {string|null}
 */
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return null;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate GST on a subtotal
 * @param {number} subtotal
 * @param {number} rate - GST rate (default 18%)
 * @returns {number}
 */
export const calculateGST = (subtotal, rate = 0.18) => Math.round(subtotal * rate);

/**
 * Calculate shipping charge (free above ₹5000)
 * @param {number} subtotal
 * @returns {number}
 */
export const calculateShipping = (subtotal) => (subtotal > 5000 ? 0 : 99);
