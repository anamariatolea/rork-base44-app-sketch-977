import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '@/constants/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'supabase.auth.token';

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
      try {
        const storedSession = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (storedSession) {
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
        console.error('Error initializing auth:', error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    };

    initializeAuth();

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
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
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
