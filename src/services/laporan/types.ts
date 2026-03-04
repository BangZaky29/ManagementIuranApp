export interface Report {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category: 'Fasilitas' | 'Kebersihan' | 'Keamanan' | 'Lainnya';
    status: 'Menunggu' | 'Diproses' | 'Selesai' | 'Ditolak';
    image_url: string | null;
    location: string | null;
    rejection_reason?: string | null;
    completion_image_url?: string | null;
    created_at: string;
    updated_at?: string;
    profiles?: {
        full_name: string;
        avatar_url: string | null;
        address: string | null;
    };
    processed_by?: {
        full_name: string;
        role: string;
    } | null;
    completed_by?: {
        full_name: string;
        role: string;
    } | null;
}
