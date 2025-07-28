// pages/login.js
import { supabase } from '../supabaseClient';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) console.error('Login error:', error.message);
    else alert('Check your email for a login link!');
  };

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

import { useRouter } from 'next/router';

const router = useRouter();

useEffect(() => {
  if (isAdmin) {
    router.push('/admin');
  }
}, [isAdmin]);

