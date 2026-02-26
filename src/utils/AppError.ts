/**
 * Shared Error Handling — Warga Pintar
 * Standardized error class and helper for consistent error handling across services.
 */

export class AppError extends Error {
    constructor(
        message: string,
        public code: string = 'UNKNOWN',
        public userMessage?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Extracts a user-friendly message from any error type.
 * Usage: catch (err) { showAlert(toUserMessage(err)); }
 */
export function toUserMessage(error: unknown): string {
    if (error instanceof AppError && error.userMessage) {
        return error.userMessage;
    }
    if (error instanceof Error) {
        // Common Supabase/Postgres error codes
        if (error.message.includes('23505')) return 'Data sudah ada (duplikat).';
        if (error.message.includes('PGRST')) return 'Data tidak ditemukan.';
        if (error.message.includes('JWT')) return 'Sesi habis. Silakan login ulang.';
        return error.message;
    }
    return 'Terjadi kesalahan. Silakan coba lagi.';
}
