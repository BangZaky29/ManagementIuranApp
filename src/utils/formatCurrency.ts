/**
 * Format number to Indonesian Rupiah currency string
 * @param value - The numeric value to format
 * @returns Formatted string like "Rp 150.000"
 */
// Safer implementation without relying on Intl (which might crash on some Android devices if locale data is missing)
export const formatCurrency = (value: number): string => {
    return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
