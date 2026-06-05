import React from 'react';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';
import { getUserInfoFromEmail, isAllowedEmail } from '@/store/auth';
import type { User } from '@/types';

export default function IndexPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser && isAllowedEmail(firebaseUser.email || '')) {
        const userInfo = getUserInfoFromEmail(firebaseUser.email || '');
        if (userInfo) {
          const userData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userInfo.name,
            role: userInfo.role,
            isAdmin: userInfo.isAdmin,
            createdAt: new Date(),
          };
          setUser(userData);
          
          // Redirect based on role
          if (userInfo.isAdmin) {
            router.push('/admin/dashboard');
          } else {
            router.push('/member/dashboard');
          }
        }
      } else {
        // Not logged in, redirect to login
        router.push('/login');
      }
    });

    return unsubscribe;
  }, [setUser, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
