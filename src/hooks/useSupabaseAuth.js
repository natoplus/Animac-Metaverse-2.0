// src/hooks/useSupabaseAuth.js
import { useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const useSupabaseAuth = () => {
  useEffect(() => {
    const testAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        console.log('✅ Supabase Auth User:', data?.user || 'None');
      } catch (err) {
        console.error('❌ Supabase Auth Error:', err.message);
      }
    };

    testAuth();
  }, []);
};

export default useSupabaseAuth;
