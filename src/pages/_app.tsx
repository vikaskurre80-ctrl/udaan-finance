import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useFinanceStore } from '@/store/finance';
import { useAuthStore } from '@/store/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserInfoFromEmail, isAllowedEmail } from '@/store/auth';
import type { User } from '@/types';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const fetchData = useFinanceStore((state) => state.fetchData);

  useEffect(() => {
    fetchData();

    if (typeof window === 'undefined' || !auth) return;

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (!firebaseUser || !firebaseUser.email) {
            return;
          }
          if (!isAllowedEmail(firebaseUser.email)) {
            setUser(null);
            return;
          }
          const userInfo = getUserInfoFromEmail(firebaseUser.email);
          if (userInfo) {
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: userInfo.name,
              role: userInfo.role,
              isAdmin: userInfo.isAdmin,
              createdAt: new Date(),
            };
            setUser(user);
          }
        }
      );
    } catch (err) {
      console.warn('Firebase auth listener failed:', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchData, setUser]);

  return <Component {...pageProps} />;
}
