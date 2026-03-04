import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseConfig';
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
                // Capture Google provider_token for Drive API usage
                setGoogleAccessToken(s?.provider_token ?? null);
                if (s?.user) {
                    await fetchProfile(s.user);
                } else {
                    setProfile(null);
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
    }, []);

    const resetPasswordFn = useCallback(async (email: string) => {
        await _resetPassword(email);
    }, []);

    const signInWithGoogle = useCallback(async () => {
        await _signInWithGoogle();
    }, []);

    const linkGoogle = useCallback(async () => {
        // Link Google identity to existing session
        const { error } = await supabase.auth.linkIdentity({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/drive.file',
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        if (error) throw error;

        // linkIdentity does NOT auto-update provider_token in local state.
        // Manually pull the refreshed session to get the new provider_token.
        const { data: refreshed } = await supabase.auth.refreshSession();
        if (refreshed?.session?.provider_token) {
            setGoogleAccessToken(refreshed.session.provider_token);
        } else {
            // Fallback: re-read current session
            const { data: current } = await supabase.auth.getSession();
            if (current?.session?.provider_token) {
                setGoogleAccessToken(current.session.provider_token);
            } else {
                // provider_token not available after linking alone.
                // Throw so the ViewModel can show an informative message.
                throw new Error('Google terhubung, tapi token Drive belum tersedia. Coba login ulang dengan tombol "Masuk dengan Google".');
            }
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