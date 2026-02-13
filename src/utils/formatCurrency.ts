/**
 * Format number to Indonesian Rupiah currency string
 * @param value - The numeric value to format
 * @returns Formatted string like "Rp 150.000"
 */
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};
