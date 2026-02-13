import { supabase } from './supabaseConfig';

// ─── Types ─────────────────────────────────────────────
export type UserRole = 'admin' | 'warga' | 'security';

export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    address: string | null;
    rt_rw: string | null;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface SignUpData {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
}

export interface SignInData {
    email: string;
    password: string;
}

// ─── Auth Functions ────────────────────────────────────

/**
 * Register a new user with email, password, and role metadata.
 * The Supabase trigger will auto-create a profile row.
 */
export async function signUpWithEmail({ email, password, fullName, phone, role }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone,
                role,
            },
        },
    });

    if (error) throw error;
    return data;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

/**
 * Sign in with Google OAuth.
 * Requires Google provider to be configured in Supabase Dashboard.
 */
export async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'wargapintar://auth/callback',
        },
    });

    if (error) throw error;
    return data;
}

/**
 * Send password reset email.
 */
export async function resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'wargapintar://auth/reset-password',
    });

    if (error) throw error;
    return data;
}

/**
 * Sign out current user.
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Get the current authenticated session.
 */
export async function getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

/**
 * Fetch user profile from the profiles table.
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }
    return data as UserProfile;
}

/**
 * Update user profile fields.
 */
export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data as UserProfile;
}
