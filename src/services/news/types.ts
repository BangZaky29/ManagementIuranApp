export interface NewsItem {
    id: number;
    title: string;
    content: string;
    category: string;
    author_id: string | null;
    created_at: string;
    is_published: boolean;
    image_url?: string | null;
    housing_complex_id?: number | null;
    author?: {
        full_name: string;
        avatar_url: string | null;
    } | null;
}
