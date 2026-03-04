export interface AppNotification {
    id: string;
    title: string;
    body: string;
    data: any;
    is_read: boolean;
    created_at: string;
}

export interface UserSoundSettings {
    user_id: string;
    notif_sound: string;
    alert_sound: string;
    vibration_enabled: boolean;
    alert_duration: number;
}
