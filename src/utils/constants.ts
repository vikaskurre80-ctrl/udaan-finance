
export const pages = {
  login: '/login',
  dashboard: '/dashboard',
  videoNew: '/video/new',
  revenue: '/revenue',
  team: '/team',
  expenses: '/expenses',
  reports: '/reports',
  settings: '/settings',
};

export const mockUser = {
  id: '1',
  email: 'vikas@udaan.com',
  name: 'Vikas Kurre',
  role: 'founder' as const,
  isAdmin: true,
  createdAt: new Date(),
};
