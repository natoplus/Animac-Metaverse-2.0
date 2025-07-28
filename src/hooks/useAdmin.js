// hooks/useAdmin.js

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Optional: to expose the user object if needed

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.warn("❌ Supabase getUser error:", error.message);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const currentUser = data?.user;

        if (!currentUser) {
          console.warn("❌ No user found (not logged in)");
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Access metadata (make sure your Supabase auth users have custom claims set)
        const role = currentUser?.user_metadata?.role;

        if (process.env.NODE_ENV === 'development') {
          console.log("👤 User metadata:", currentUser.user_metadata);
        }

        setUser(currentUser);
        setIsAdmin(role === 'admin');
      } catch (err) {
        console.error("🚨 Error checking admin role:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading, user };
}
