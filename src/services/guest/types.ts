export type VisitorType = 'tamu' | 'gojek' | 'kurir' | 'pekerja' | 'lainnya';
export type VisitorStatus = 'pending' | 'active' | 'completed' | 'rejected';

export interface Visitor {
    id: string;
    visitor_name: string;
    visitor_type: VisitorType;
    destination_user_id: string; // Warga's UUID
    purpose: string | null;
    pin_code: string | null;
    status: VisitorStatus;
    check_in_time: string | null;
    check_out_time: string | null;
    created_by: string | null;
    created_at: string;
    // Joined profile
    profiles?: {
        full_name: string;
        housing_complex_id: number | null;
        rt_rw: string | null;
        housing_complexes?: {
            name: string;
        } | null;
    } | null;
}
