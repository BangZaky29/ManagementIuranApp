// From paymentConfirmationService
export interface PendingPaymentItem {
    id: string;
    user_id: string;
    fee_id: number;
    amount: number;
    period: string;
    status: string;
    payment_method: string | null;
    proof_url: string | null;
    created_at: string;
    updated_at: string;
    confirmed_by: string | null;
    confirmed_at: string | null;
    admin_notes: string | null;
    rejection_reason: string | null;
    profiles?: {
        full_name: string;
        address: string | null;
        avatar_url: string | null;
        wa_phone: string | null;
    };
    fees?: {
        name: string;
    };
}

export interface PaymentConfirmationLog {
    id: number;
    payment_id: string;
    admin_id: string;
    action: 'approved' | 'rejected';
    notes: string | null;
    created_at: string;
}

// From paymentMethodService
export interface PaymentMethod {
    id: number;
    housing_complex_id: number;
    method_type: 'bank_transfer' | 'ewallet' | 'qris';
    method_name: string;
    account_number: string | null;
    account_holder: string | null;
    description: string | null;
    qris_image_url: string | null;
    is_active: boolean;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePaymentMethodData {
    housing_complex_id: number;
    method_type: 'bank_transfer' | 'ewallet' | 'qris';
    method_name: string;
    account_number?: string;
    account_holder?: string;
    description?: string;
    qris_image_url?: string;
}

export interface EwalletVaCode {
    id: number;
    ewallet_name: string;
    bank_name: string;
    va_code: string;
    format_example: string;
}

// From receiptService
export interface ReceiptData {
    paymentId: string;
    userName: string;
    amount: number;
    period: string;
    paymentMethod: string;
    paidAt: string;
    complexName: string;
    items?: { name: string; amount: number }[];
}
