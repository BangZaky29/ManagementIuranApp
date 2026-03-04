export interface Fee {
    id: number;
    name: string;
    amount: number;
    due_date_day: number;
    is_active: boolean;
    housing_complex_id: number;
    active_from?: string | null;
    active_to?: string | null;
    created_at: string;
}

export interface PaymentRecord {
    id: string;
    user_id: string;
    fee_id: number;
    amount: number;
    period: string; // YYYY-MM-DD
    status: 'pending' | 'paid' | 'overdue' | 'rejected';
    payment_method: string | null;
    paid_at: string | null;
    proof_url: string | null;
    confirmed_by: string | null;
    confirmed_at: string | null;
    admin_notes: string | null;
    rejection_reason: string | null;
    fees?: { name: string };
}

export interface BillItem {
    fee: Fee;
    isPaid: boolean;
    status: 'paid' | 'pending' | 'unpaid' | 'rejected';
    amount: number;
    rejectionReason?: string;
    rawPaymentId?: string;
}

export interface BillingPeriod {
    id: string; // format YYYY-MM
    periodDate: string; // format YYYY-MM-01
    monthName: string; // e.g. "Januari 2026"
    status: 'paid' | 'pending' | 'unpaid' | 'overdue' | 'partial' | 'rejected';
    totalAmount: number;
    unpaidAmount: number;
    items: BillItem[];
    isCurrentMonth: boolean;
    isOverdue: boolean;
}

export interface SmartBillSummary {
    periods: BillingPeriod[];
    totalOverdue: number;
    totalCurrent: number;
    totalUnpaid: number;
}
