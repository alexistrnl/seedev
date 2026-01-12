'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginSignupClient from '../login/LoginSignupClient';

export default function SignupPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Rediriger vers /login qui gère maintenant les deux modes
    router.replace('/login');
  }, [router]);

  return null;
}
