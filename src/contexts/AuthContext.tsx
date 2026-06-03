import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { getCurrentUserProfile, type User } from '../services/supabaseService';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  refreshUserProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshUserProfile = async () => {
    const userId = session?.user?.id;
    if (!userId) {
      setUserProfile(null);
      return;
    }

    try {
      const profile = await withTimeout(getCurrentUserProfile(userId), 8000);
      setUserProfile(profile);
      if (profile?.role) {
        window.localStorage.setItem('tic_last_role', profile.role);
      }
    } catch {
      setUserProfile((prev) => (prev && prev.id === userId ? prev : null));
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data } = await withTimeout(supabase.auth.getSession(), 8000);
        const nextSession = data.session;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        if (nextSession?.user) {
          try {
            const profile = await withTimeout(getCurrentUserProfile(nextSession.user.id), 8000);
            setUserProfile(profile);
            if (profile?.role) {
              window.localStorage.setItem('tic_last_role', profile.role);
            }
          } catch {
            setUserProfile((prev) => (prev && prev.id === nextSession.user.id ? prev : null));
          }
        } else {
          setUserProfile(null);
        }
      } catch {
        setSession(null);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        try {
          const profile = await withTimeout(getCurrentUserProfile(nextSession.user.id), 8000);
          setUserProfile(profile);
          if (profile?.role) {
            window.localStorage.setItem('tic_last_role', profile.role);
          }
        } catch {
          setUserProfile((prev) => (prev && prev.id === nextSession.user.id ? prev : null));
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const redirectToLoginIfLoggedOut = async () => {
      const path = window.location.pathname || '/';
      if (!path.startsWith('/admin')) return;

      try {
        const { data } = await withTimeout(supabase.auth.getSession(), 8000);
        if (!data.session) {
          window.location.replace('/login');
        }
      } catch {
        window.location.replace('/login');
      }
    };

    const handlePopState = () => {
      void redirectToLoginIfLoggedOut();
    };

    const handlePageShow = () => {
      void redirectToLoginIfLoggedOut();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // Auto-logout on inactivity
  useEffect(() => {
    if (!session) return;

    const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;
    lastActivityRef.current = Date.now();

    const clearTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };

    const scheduleCheck = () => {
      clearTimer();
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = INACTIVITY_TIMEOUT - elapsed;
      const nextDelay = Math.max(0, Math.min(remaining, 60_000));

      inactivityTimerRef.current = setTimeout(() => {
        const elapsedNow = Date.now() - lastActivityRef.current;
        if (elapsedNow >= INACTIVITY_TIMEOUT) {
          signOut();
          return;
        }
        if (document.visibilityState === 'visible') scheduleCheck();
      }, nextDelay);
    };

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
      if (document.visibilityState === 'visible') scheduleCheck();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastActivityRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT) {
          signOut();
          return;
        }
        scheduleCheck();
      } else {
        clearTimer();
      }
    };

    // Event listeners for user activity
    window.addEventListener('mousemove', recordActivity);
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('click', recordActivity);
    window.addEventListener('scroll', recordActivity);
    window.addEventListener('pointerdown', recordActivity);
    window.addEventListener('touchstart', recordActivity);
    window.addEventListener('focus', recordActivity);
    document.addEventListener('visibilitychange', handleVisibility);

    scheduleCheck();

    return () => {
      window.removeEventListener('mousemove', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('click', recordActivity);
      window.removeEventListener('scroll', recordActivity);
      window.removeEventListener('pointerdown', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
      window.removeEventListener('focus', recordActivity);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimer();
    };
  }, [session]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        8000,
      );
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.localStorage.removeItem('tic_last_role');
    window.location.replace('/login');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login?reset=true',
    });
    return { error };
  };

  const hasPermission = (permission: string): boolean => {
    if (!userProfile?.role) return false;
    
    const role = userProfile.role as any;
    const rolePermissions: Record<string, string[]> = {
      super_admin: ['*'],
      admin: ['*'],
      engineer: ['read:jobs', 'read:equipment', 'write:inspections'],
      sales: ['read:clients', 'read:jobs'],
    };
    const permissions = rolePermissions[role] || [];
    
    return permissions.includes('*') || permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, session, loading, signIn, signOut, resetPassword, refreshUserProfile, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
