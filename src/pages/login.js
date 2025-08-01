// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) console.error('Login error:', error.message);
    else alert('Check your email for a login link!');
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Replace this logic with your actual admin-checking logic
        const { data: profile } = await supabase
          .from('profiles') // or your user role table
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          setIsAdmin(true);
        }
      }
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin]);

  return (
    <div>
      <input
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <button onClick={handleLogin}>Sign In</button>
    </div>
  );
}
