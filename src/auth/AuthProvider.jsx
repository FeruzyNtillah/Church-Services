// src/auth/AuthProvider.jsx
import { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '../supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, full_name, role')
          .eq('id', currentUser.id)
          .single();
        setProfile(profileData ?? null);
      } else {
        setProfile(null);
      }

      setAuthLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, email, full_name, role')
            .eq('id', currentUser.id)
            .single();
          setProfile(profileData ?? null);
        } else {
          setProfile(null);
        }

        setAuthLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: profile?.role ?? 'user',
        isAdmin: profile?.role === 'admin',
        authLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Export useAuth hook here
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
