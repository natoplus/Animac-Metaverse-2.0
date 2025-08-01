// src/hooks/useAdmin.js
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient'; // ✅ Adjust if path changes

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (!supabase || !supabase.auth) {
          console.error("❌ Supabase client is not properly initialized.");
          setIsAdmin(false);
          return;
        }

        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.warn("⚠️ Error fetching user:", error.message);
          setIsAdmin(false);
          return;
        }

        if (!data?.user) {
          console.log("⚠️ No user logged in.");
          setIsAdmin(false);
          return;
        }

        const role = data.user?.user_metadata?.role || localStorage.getItem('role');
        if (role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

      } catch (err) {
        console.error("❌ Unexpected error in useAdmin:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
}
