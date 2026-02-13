/**
 * Shared TypeScript Interfaces — Warga Pintar
 */

// ─── Auth ────────────────────────────────────────
export interface User {
    name: string;
    address: string;
    rt_rw: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
}

// ─── Iuran ───────────────────────────────────────
export interface PaymentDetail {
    label: string;
    value: string;
}

export interface PaymentHistoryItem {
    id: string;
    period: string;
    amount: string;
    status: 'Lunas' | 'Terlambat' | 'Pending';
    date: string;
    details: PaymentDetail[];
    isExpanded?: boolean;
}

// ─── Laporan ─────────────────────────────────────
export type ReportCategory = 'Fasilitas' | 'Kebersihan' | 'Keamanan' | 'Lainnya';
export type ReportStatus = 'Diproses' | 'Selesai' | 'Menunggu';

export interface ReportItem {
    id: string;
    title: string;
    status: ReportStatus;
    date: string;
    category: ReportCategory;
    description?: string;
}

// ─── News ────────────────────────────────────────
export interface NewsItem {
    id: number;
    title: string;
    date: string;
    content: string;
    image?: any;
    category: string;
}

// ─── Quick Actions ───────────────────────────────
export interface QuickAction {
    id: string;
    title: string;
    icon: string;
    route?: string;
    color: string;
    bgColor: string;
}

// ─── Alert ───────────────────────────────────────
export type AlertType = 'success' | 'info' | 'warning' | 'error';

export interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress: () => void;
}

export interface AlertConfig {
    title: string;
    message: string;
    type: AlertType;
    buttons: AlertButton[];
}
