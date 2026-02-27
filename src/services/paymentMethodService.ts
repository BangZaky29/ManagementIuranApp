import { supabase } from '../lib/supabaseConfig';
import { AppError } from '../utils/AppError';

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

/**
 * Fetch payment methods for the current user's housing complex (active only).
 * Used by warga to see available payment methods.
 */
export const fetchPaymentMethodsForUser = async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('method_type', { ascending: true });

    if (error) throw new AppError(error.message, 'FETCH_PAYMENT_METHODS', 'Gagal memuat metode pembayaran.');
    return (data || []) as PaymentMethod[];
};

/**
 * Fetch ALL payment methods for admin (including inactive).
 * RLS will filter by admin's housing_complex_id.
 */
export const fetchAdminPaymentMethods = async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new AppError(error.message, 'FETCH_ADMIN_METHODS', 'Gagal memuat metode pembayaran.');
    return (data || []) as PaymentMethod[];
};

/**
 * Create a new payment method (admin only).
 */
export const createPaymentMethod = async (
    data: CreatePaymentMethodData,
    adminId: string
): Promise<PaymentMethod> => {
    const { data: result, error } = await supabase
        .from('payment_methods')
        .insert({
            ...data,
            created_by: adminId,
        })
        .select()
        .single();

    if (error) throw new AppError(error.message, 'CREATE_METHOD', 'Gagal menambah metode pembayaran.');
    return result as PaymentMethod;
};

/**
 * Update an existing payment method (admin only).
 */
export const updatePaymentMethod = async (
    id: number,
    updates: Partial<CreatePaymentMethodData> & { is_active?: boolean }
): Promise<PaymentMethod> => {
    const { data, error } = await supabase
        .from('payment_methods')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new AppError(error.message, 'UPDATE_METHOD', 'Gagal mengupdate metode pembayaran.');
    return data as PaymentMethod;
};

/**
 * Delete a payment method (admin only).
 */
export const deletePaymentMethod = async (id: number): Promise<void> => {
    const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

    if (error) throw new AppError(error.message, 'DELETE_METHOD', 'Gagal menghapus metode pembayaran.');
};

/**
 * Upload QRIS image to payment-proofs bucket and return public URL.
 */
export const uploadQrisImage = async (
    adminId: string,
    imageUri: string,
    fileName: string
): Promise<string> => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const filePath = `qris/${adminId}/${fileName}`;
    const { error } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, blob, { upsert: true, contentType: 'image/jpeg' });

    if (error) throw new AppError(error.message, 'UPLOAD_QRIS', 'Gagal mengupload gambar QRIS.');

    const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

    return urlData.publicUrl;
};
