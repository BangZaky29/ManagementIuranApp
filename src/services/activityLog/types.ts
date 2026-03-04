export interface ActivityLog {
    id: string;
    housing_complex_id: number;
    user_id: string;
    action_type: 'payment' | 'report' | 'panic' | 'visitor';
    action_title: string;
    description: string;
    created_at: string;
    profiles?: {
        full_name: string;
        avatar_url: string | null;
        wa_phone: string | null;
        role?: string;
    };
}
