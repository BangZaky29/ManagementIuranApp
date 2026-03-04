export interface AdminFee {
    id: number;
    name: string;
    amount: number;
    due_date_day: number;
    is_active: boolean;
    housing_complex_id: number;
    active_from: string | null;
    active_to: string | null;
    created_at: string;
}

export interface CreateFeeData {
    name: string;
    amount: number;
    due_date_day: number;
    housing_complex_id: number;
    active_from?: string | null;
    active_to?: string | null;
}

export interface FeePaymentStat {
    fee: AdminFee;
    totalWarga: number;
    paidCount: number;
    pendingCount: number;
    unpaidCount: number;
    collectedAmount: number;
    expectedAmount: number;
    collectionRate: number; // 0-100
}

export interface PayerInfo {
    userId: string;
    fullName: string;
    address: string | null;
    avatarUrl: string | null;
    status: 'paid' | 'pending' | 'unpaid' | 'rejected';
    amount: number;
    paidAt: string | null;
    paymentMethod: string | null;
}

export interface MonthlyRevenue {
    totalExpected: number;
    totalCollected: number;
    totalPending: number;
    totalWarga: number;
    paidWargaCount: number;
    collectionRate: number;
}

export interface OverallRevenue {
    totalExpected: number;
    totalCollected: number;
    totalPending: number;
    totalWarga: number;
}
