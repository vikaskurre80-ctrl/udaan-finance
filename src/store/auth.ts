import { create } from 'zustand';
import { User, TeamRole } from '@/types';

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  role: TeamRole | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  isUserAllowed: (requiredRoles?: TeamRole[]) => boolean;
}

// Admin and team member definitions
const ADMIN_EMAILS = ['vikaskurre80@gmail.com'];

const TEAM_MEMBERS: Record<string, { name: string; role: TeamRole }> = {
  'pravinchaturvedi40320@gmail.com': { name: 'Pravin', role: 'client_manager' },
  'dhaneshwarnishad780@gmail.com': { name: 'Dhanewar Nishad', role: 'shoot' },
  'starrock22648@gmail.com': { name: 'Chitransh Mistra', role: 'smm' },
  'aishwarayakurre@gmail.com': { name: 'Aishwarya Kurre', role: 'edit' },
  'anurag.op.ar@gmail.com': { name: 'Anurag', role: 'ads' },
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  role: null,
  isLoading: false,

  setUser: (user: User | null) => {
    const isAdmin = user ? ADMIN_EMAILS.includes(user.email) : false;
    const role = user?.role || null;

    set({
      user,
      isLoggedIn: !!user,
      isAdmin,
      role,
    });
  },

  logout: () =>
    set({
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      role: null,
    }),

  isUserAllowed: (requiredRoles?: TeamRole[]) => {
    const { user, isAdmin } = get();

    if (!user) return false;
    if (isAdmin) return true; // Admin has access to everything
    if (!requiredRoles || requiredRoles.length === 0) return true;

    return requiredRoles.includes(user.role);
  },
}));

// Helper to get user info from email
export const getUserInfoFromEmail = (email: string): { name: string; role: TeamRole; isAdmin: boolean } | null => {
  if (ADMIN_EMAILS.includes(email)) {
    return { name: 'Vikas Kurre', role: 'founder', isAdmin: true };
  }

  const teamMemberInfo = TEAM_MEMBERS[email];
  if (teamMemberInfo) {
    return { ...teamMemberInfo, isAdmin: false };
  }

  return null;
};

// Helper to check if email is allowed
export const isAllowedEmail = (email: string): boolean => {
  return (
    ADMIN_EMAILS.includes(email) || 
    Object.keys(TEAM_MEMBERS).includes(email)
  );
};
