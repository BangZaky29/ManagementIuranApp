import { supabase } from './supabaseConfig';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

// ─── Types ─────────────────────────────────────────────
export type UserRole = 'admin' | 'warga' | 'security';

export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    wa_phone: string | null;  // Added
    username: string | null;  // Added
    nik: string | null;       // Added
    role: UserRole;
    address: string | null;
    rt_rw: string | null;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    housing_complex_id?: number | null;
    housing_complexes?: {
        name: string;
    } | null;
}

export interface SignUpData {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    metadata?: Record<string, any>;
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
export async function signUpWithEmail({ email, password, fullName, phone, role, metadata }: SignUpData) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: makeRedirectUri({
                scheme: 'wargapintar',
                path: 'auth/callback',
            }),
            data: {
                full_name: fullName,
                phone,
                role,
                ...metadata,
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
 * Sign in with Email OR Username.
 * If input is not an email, lookup email from profiles first.
 */
export async function signInWithEmailOrUsername({ identifier, password }: { identifier: string; password: string }) {
    let email = identifier;

    // Simple check: if no '@', assume username
    if (!identifier.includes('@')) {
        const { data, error } = await supabase
            .rpc('get_email_by_username', { username_input: identifier });

        if (error || !data) {
            throw new Error('Username tidak ditemukan.');
        }
        email = data;
    }

    return signInWithEmail({ email, password });
}

/**
 * Sign in with Google OAuth using expo-web-browser.
 * Opens a browser for Google login, then handles the callback.
 */
export async function signInWithGoogle() {
    const redirectTo = makeRedirectUri({
        scheme: 'wargapintar',
        path: 'auth/callback',
    });

    // Get the OAuth URL from Supabase
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo,
            skipBrowserRedirect: true, // We handle browser manually
        },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned from Supabase');

    // Open the browser for OAuth
    const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
        { showInRecents: true }
    );

    if (result.type === 'success') {
        const url = result.url;
        // Extract tokens from URL fragment
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
        }
    } else if (result.type === 'cancel' || result.type === 'dismiss') {
        throw new Error('Login dibatalkan');
    }
}

/**
 * Send password reset email.
 */
export async function resetPassword(email: string) {
    const redirectUrl = makeRedirectUri({
        scheme: 'wargapintar',
        path: 'auth/reset-password',
    });

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
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

export async function getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            housing_complexes (
                name
            )
        `)
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.warn('Profile fetch error:', error.message);
        return null; // Don't crash on RLS or other errors
    }
    return data as UserProfile;
}

// createProfile removed - handled by database trigger

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
