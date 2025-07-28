// hooks/useAdmin.js

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check user metadata
      const role = user?.user_metadata?.role || null;

      setIsAdmin(role === 'admin');
      setLoading(false);
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
}
