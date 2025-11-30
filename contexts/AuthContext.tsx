import createContextHook from '@nkzw/create-context-hook';
import { supabase, isSupabaseConfigured } from '@/constants/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'supabase.auth.token';
const LOCAL_USER_KEY = 'local.user.id';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

interface AuthActions {
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth...');
      if (!isSupabaseConfigured || !supabase) {
        console.log('[AuthContext] Supabase is not configured. Using local demo mode.');
        
        let localUserId = await AsyncStorage.getItem(LOCAL_USER_KEY);
        console.log('[AuthContext] Local user ID:', localUserId);
        if (!localUserId) {
          localUserId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          console.log('[AuthContext] Generated new local user ID:', localUserId);
          await AsyncStorage.setItem(LOCAL_USER_KEY, localUserId);
        }

        const mockUser: User = {
          id: localUserId,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: 'demo@example.com',
        } as User;

        if (mounted) {
          console.log('[AuthContext] Setting local auth state with mock user:', mockUser.id);
          setAuthState({
            user: mockUser,
            session: null,
            loading: false,
            initialized: true,
          });
        }
        console.log('[AuthContext] Auth initialization complete (local mode)');
        return;
      }

      try {
        const storedSession = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            const { data, error } = await supabase.auth.setSession({
              access_token: parsedSession.access_token,
              refresh_token: parsedSession.refresh_token,
            });

            if (mounted && !error && data.session) {
              setAuthState({
                user: data.session.user,
                session: data.session,
                loading: false,
                initialized: true,
              });
              return;
            }
          } catch (sessionError) {
            console.log('Error restoring session, clearing stored data:', sessionError);
            await AsyncStorage.removeItem(STORAGE_KEY);
          }
        }

        const { data } = await supabase.auth.getSession();
        
        if (mounted) {
          if (data.session) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.session));
          }
          
          setAuthState({
            user: data.session?.user ?? null,
            session: data.session,
            loading: false,
            initialized: true,
          });
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        if (mounted) {
          console.log('[AuthContext] Setting auth state to null due to error');
          setAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
      console.log('[AuthContext] Auth initialization complete');
    };

    initializeAuth();

    if (!isSupabaseConfigured || !supabase) {
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (mounted) {
          if (session) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
            setAuthState({
              user: session.user,
              session: session,
              loading: false,
              initialized: true,
            });
          } else {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setAuthState({
              user: null,
              session: null,
              loading: false,
              initialized: true,
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: { message: 'Supabase is not configured' } as AuthError };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      return;
    }
    await supabase.auth.signOut();
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  } as AuthState & AuthActions;
});
