export interface PanicLog {
    id: string;
    user_id: string;
    location: string | null;
    resolved_at: string | null;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string | null;
        housing_complex_id: number | null;
        rt_rw: string | null;
    } | null;
}
