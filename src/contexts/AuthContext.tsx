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
} from '../lib/authService';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (data: SignInData) => Promise<any>;
    signUp: (data: SignUpData) => Promise<{ needsConfirmation: boolean }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Default TRUE

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
    }, []);

    const resetPasswordFn = useCallback(async (email: string) => {
        await _resetPassword(email);
    }, []);

    const signInWithGoogle = useCallback(async () => {
        await _signInWithGoogle();
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
                signIn,
                signUp,
                signOut,
                resetPassword: resetPasswordFn,
                signInWithGoogle,
                refreshProfile,
                updateUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);