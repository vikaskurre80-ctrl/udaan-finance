import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import type { TeamRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRoles?: TeamRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requiredRoles = [],
}) => {
  const router = useRouter();
  const { user, isAdmin, isUserAllowed } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.push('/member/dashboard');
      return;
    }

    if (!requireAdmin && isAdmin) {
      router.push('/admin/dashboard');
      return;
    }

    if (requiredRoles.length > 0 && !isUserAllowed(requiredRoles)) {
      router.push('/member/dashboard');
      return;
    }

    setIsAuthorized(true);
  }, [user, isAdmin, requireAdmin, requiredRoles, isUserAllowed, router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
