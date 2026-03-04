import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseConfig';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import {
    signInWithEmail as _signIn,
    signInWithEmailOrUsername as _signInWithEmailOrUsername,
    signUpWithEmail as _signUp,
    signOut as _signOut,
    resetPassword as _resetPassword,
    signInWithGoogle as _signInWithGoogle,
    getProfile,
    UserProfile,
    SignInData,
    SignUpData,
} from '../services/auth';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    googleAccessToken: string | null;
    signIn: (data: SignInData) => Promise<any>;
    signUp: (data: SignUpData) => Promise<{ needsConfirmation: boolean }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    linkGoogle: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Default TRUE
    const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

    const fetchProfile = useCallback(async (u: User) => {
        try {
            let p = await getProfile(u.id);

            // Mekanisme retry jika trigger database sedikit terlambat (Sangat penting untuk user baru)
            if (!p) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                p = await getProfile(u.id);
            }

            setProfile(p);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setProfile(null);
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Ambil initial session
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                setSession(initialSession);
                setUser(initialSession?.user ?? null);

                if (initialSession?.user) {
                    await fetchProfile(initialSession.user);
                    const storedGoogleToken = await AsyncStorage.getItem('google_provider_token');
                    if (storedGoogleToken) {
                        setGoogleAccessToken(storedGoogleToken);
                    }
                }
            } catch (error) {
                console.error("Auth init error:", error);
            } finally {
                // HANYA setelah semua pengecekan selesai, isLoading jadi false
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Subscribe ke perubahan auth (Login/Logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, s) => {
                setSession(s);
                setUser(s?.user ?? null);

                if (s?.user) {
                    await fetchProfile(s.user);
                    // Ensure we don't nullify an active provider_token on standard auth state changes (e.g. refresh)
                    if (s.provider_token) {
                        setGoogleAccessToken(s.provider_token);
                        await AsyncStorage.setItem('google_provider_token', s.provider_token);
                    } else if (_event === 'INITIAL_SESSION' || _event === 'SIGNED_IN') {
                        const stored = await AsyncStorage.getItem('google_provider_token');
                        if (stored) setGoogleAccessToken(stored);
                    }
                } else {
                    setProfile(null);
                    setGoogleAccessToken(null);
                    await AsyncStorage.removeItem('google_provider_token');
                }
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const signIn = useCallback(async (data: SignInData) => {
        // Support Email OR Username
        return await _signInWithEmailOrUsername({ identifier: data.email, password: data.password });
    }, []);

    const signUp = useCallback(async (data: SignUpData) => {
        const result = await _signUp(data);
        return { needsConfirmation: !result.session };
    }, []);

    const signOut = useCallback(async () => {
        await _signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
        setGoogleAccessToken(null);
        await AsyncStorage.removeItem('google_provider_token');
    }, []);

    const resetPasswordFn = useCallback(async (email: string) => {
        await _resetPassword(email);
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const result = await _signInWithGoogle();
        if (result?.providerToken) {
            setGoogleAccessToken(result.providerToken);
            await AsyncStorage.setItem('google_provider_token', result.providerToken);
        }
    }, []);

    const linkGoogle = useCallback(async () => {
        // Ensure supabase client has the latest session context ready 
        const { data: { session: currentSession }, error: currentSessionError } = await supabase.auth.getSession();
        if (currentSessionError || !currentSession) {
            throw new Error('Sesi tidak ditemukan atau kedaluwarsa. Silakan login ulang sebelum menghubungkan Google.');
        }

        const redirectTo = makeRedirectUri({
            scheme: 'warlok',
            path: 'auth/callback',
        });

        // Get the OAuth URL for linking from Supabase
        const { data: linkData, error: linkError } = await supabase.auth.linkIdentity({
            provider: 'google',
            options: {
                redirectTo,
                skipBrowserRedirect: true,
                scopes: 'https://www.googleapis.com/auth/drive.file',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (linkError) throw linkError;
        if (!linkData?.url) throw new Error('No OAuth URL returned from Supabase for linking');

        // Open the browser for OAuth
        const result = await WebBrowser.openAuthSessionAsync(
            linkData.url,
            redirectTo,
            { showInRecents: true }
        );

        if (result.type === 'success') {
            const url = result.url;
            const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const providerToken = params.get('provider_token');

            if (providerToken) {
                setGoogleAccessToken(providerToken);
                await AsyncStorage.setItem('google_provider_token', providerToken);
            }

            if (accessToken && refreshToken) {
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });
                if (sessionError) throw sessionError;
            }

            const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) throw refreshError;

            // Force AuthStateChange event
            const { data: { session: updatedSession } } = await supabase.auth.getSession();
            setSession(updatedSession);

            if (!providerToken && !updatedSession?.provider_token) {
                throw new Error('Google terhubung, tapi token Drive belum tersedia. Coba login ulang dengan tombol "Masuk dengan Google".');
            }
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
            throw new Error('Proses menghubungkan Google dibatalkan');
        }
    }, []);


    const refreshProfile = useCallback(async () => {
        if (user) await fetchProfile(user);
    }, [user, fetchProfile]);

    const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
        if (!user) return;
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
        if (error) throw error;
        setProfile(data as UserProfile);
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                isLoading,
                isAuthenticated: !!session && !!user,
                googleAccessToken,
                signIn,
                signUp,
                signOut,
                resetPassword: resetPasswordFn,
                signInWithGoogle,
                linkGoogle,
                refreshProfile,
                updateUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);