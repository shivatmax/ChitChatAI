import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const SupabaseAuthContext = createContext<
  | { session: Session | null; loading: boolean; logout: () => Promise<void> }
  | undefined
>(undefined);

export const SupabaseAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <SupabaseAuthProviderInner>{children}</SupabaseAuthProviderInner>;
};

export const SupabaseAuthProviderInner = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          localStorage.setItem('userId', session.user.id);
        } else {
          const storedUserId = localStorage.getItem('userId');
          if (!storedUserId) {
            const { data: newUser, error } = await supabase
              .from('User')
              .insert({
                id: uuidv4(),
                name: 'New User',
                persona: 'Friendly',
                about: ['chatting'],
                knowledge_base: 'Basic knowledge',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (error) {
              console.error('Error creating new user:', error);
              throw error;
            }

            if (newUser && newUser.id) {
              localStorage.setItem('userId', newUser.id);
            } else {
              throw new Error('Failed to create new user: No data returned');
            }
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          localStorage.setItem('userId', session.user.id);
        }
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      setLoading(false);
    };
  }, [queryClient]);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    localStorage.removeItem('userId');
    queryClient.invalidateQueries({ queryKey: ['user'] });
    setLoading(false);
  };

  return (
    <SupabaseAuthContext.Provider value={{ session, loading, logout }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  return useContext(SupabaseAuthContext);
};

export const SupabaseAuthUI = () => (
  <Auth
    supabaseClient={supabase}
    appearance={{ theme: ThemeSupa }}
    theme='default'
    providers={[]}
  />
);
