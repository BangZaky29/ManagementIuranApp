export interface VerifiedResident {
    id: string;
    nik: string;
    full_name: string;
    role: 'warga' | 'security';
    description?: string;
    access_token: string;
    is_claimed: boolean;
    claimed_at?: string;
    created_at: string;
    housing_complex_id?: number | null;
    housing_complexes?: {
        name: string;
    } | null;
    user?: {
        avatar_url: string | null;
    } | {
        avatar_url: string | null;
    }[] | null;
}
