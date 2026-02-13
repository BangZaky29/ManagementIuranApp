import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseConfig';
import {
    signInWithEmail as _signIn,
    signUpWithEmail as _signUp,
    signOut as _signOut,
    resetPassword as _resetPassword,
    signInWithGoogle as _signInWithGoogle,
    getProfile,
    UserProfile,
    UserRole,
    SignUpData,
    SignInData,
} from '../lib/authService';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (data: SignInData) => Promise<void>;
    signUp: (data: SignUpData) => Promise<{ needsConfirmation: boolean }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    signIn: async () => { },
    signUp: async () => ({ needsConfirmation: false }),
    signOut: async () => { },
    resetPassword: async () => { },
    signInWithGoogle: async () => { },
    refreshProfile: async () => { },
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch profile when user changes
    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const p = await getProfile(userId);
            setProfile(p);
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setProfile(null);
        }
    }, []);

    // Listen for auth state changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);
            if (s?.user) {
                fetchProfile(s.user.id);
            }
            setIsLoading(false);
        });

        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, s) => {
                setSession(s);
                setUser(s?.user ?? null);
                if (s?.user) {
                    await fetchProfile(s.user.id);
                } else {
                    setProfile(null);
                }
                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const signIn = useCallback(async (data: SignInData) => {
        await _signIn(data);
        // onAuthStateChange will handle state update
    }, []);

    const signUp = useCallback(async (data: SignUpData) => {
        const result = await _signUp(data);
        // If email confirmation is enabled, session will be null
        const needsConfirmation = !result.session;
        return { needsConfirmation };
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
        if (user) {
            await fetchProfile(user.id);
        }
    }, [user, fetchProfile]);

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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
