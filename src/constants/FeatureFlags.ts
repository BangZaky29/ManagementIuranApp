import { GoTrueAdminApi } from "@supabase/supabase-js";

/**
 * Centralize all feature toggles here.
 * This allows us to easily enable/disable features 
 * across different environments or during development.
 */
export const FeatureFlags = {
    // Set to false as requested for "Under Development" state
    IS_OTHERS_ENABLED: false,
    IS_MESSAGE_ENABLED: false,
    IS_DARK_MODE_ENABLED: false,
    IS_SOUND_SETTINGS_ENABLED: false,
    IS_AUTO_BACKUP_ENABLED: true,
    IS_BACKUP_RESTORE_ENABLED: true,
};
