export interface Banner {
    id: string;
    housing_complex_id: number;
    title: string;
    description?: string;
    image_url: string;
    target_url: string | null;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    created_at: string;
}
