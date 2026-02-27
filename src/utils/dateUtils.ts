/**
 * Safe date formatting for React Native (Hermes/Android) production builds.
 * Avoids toLocaleDateString with options which can cause crashes.
 */

const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

const MONTHS_FULL = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format: "27 Feb 2026"
 */
export const formatDateSafe = (dateInput: string | Date): string => {
    try {
        const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(d.getTime())) return '-';
        
        const day = d.getDate().toString().padStart(2, '0');
        const month = MONTHS[d.getMonth()];
        const year = d.getFullYear();
        
        return `${day} ${month} ${year}`;
    } catch (e) {
        return '-';
    }
};

/**
 * Format: "27 Feb 2026, 13:06"
 */
export const formatDateTimeSafe = (dateInput: string | Date): string => {
    try {
        const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(d.getTime())) return '-';
        
        const day = d.getDate().toString().padStart(2, '0');
        const month = MONTHS[d.getMonth()];
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        
        return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch (e) {
        return '-';
    }
};

/**
 * Format: "Feb 2026"
 */
export const formatMonthYearSafe = (dateInput: string | Date): string => {
    try {
        const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(d.getTime())) return '-';
        
        const month = MONTHS[d.getMonth()];
        const year = d.getFullYear();
        
        return `${month} ${year}`;
    } catch (e) {
        return '-';
    }
};

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Format: "Jumat, 27 Februari 2026"
 */
export const formatFullDateSafe = (dateInput: string | Date): string => {
    try {
        const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(d.getTime())) return '-';
        
        const dayName = DAYS[d.getDay()];
        const day = d.getDate();
        const monthName = MONTHS_FULL[d.getMonth()];
        const year = d.getFullYear();
        
        return `${dayName}, ${day} ${monthName} ${year}`;
    } catch (e) {
        return '-';
    }
};
