import { create } from 'zustand';
import { TeamMember, Video, Expense, User } from '@/types';

interface FinanceStore {
  // Auth
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;

  // Team
  teamMembers: TeamMember[];
  addTeamMember: (member: TeamMember) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  setTeamMembers: (members: TeamMember[]) => void;

  // Videos
  videos: Video[];
  addVideo: (video: Video) => void;
  updateVideo: (id: string, video: Partial<Video>) => void;
  setVideos: (videos: Video[]) => void;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  setExpenses: (expenses: Expense[]) => void;

  // Loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  fetchData: () => Promise<void>;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  // Auth
  user: null,
  isLoggedIn: false,
  login: (user: User) => set({ user, isLoggedIn: true }),
  logout: () => set({ user: null, isLoggedIn: false }),

  // Team
  teamMembers: [
    { id: '1', name: 'Vikas', role: 'shoot', paymentPerVideo: 100 },
    { id: '2', name: 'Dhanewar', role: 'shoot', paymentPerVideo: 100 },
    { id: '3', name: 'Aisha', role: 'edit', paymentPerVideo: 150 },
    { id: '4', name: 'Chitransh Mishra', role: 'smm', paymentPerVideo: 50 },
    { id: '5', name: 'Pravin', role: 'client_manager', paymentPerVideo: 50 },
    { id: '6', name: 'Anurag', role: 'ads', paymentPerVideo: 50 },
  ],
  addTeamMember: (member: TeamMember) =>
    set((state) => ({ teamMembers: [...state.teamMembers, member] })),
  updateTeamMember: (id: string, updates: Partial<TeamMember>) =>
    set((state) => ({
      teamMembers: state.teamMembers.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removeTeamMember: (id: string) =>
    set((state) => ({ teamMembers: state.teamMembers.filter((m) => m.id !== id) })),
  setTeamMembers: (members: TeamMember[]) => set({ teamMembers: members }),

  // Videos
  videos: [],
  addVideo: (video: Video) =>
    set((state) => ({ videos: [...state.videos, video] })),
  updateVideo: (id: string, updates: Partial<Video>) =>
    set((state) => ({
      videos: state.videos.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),
  setVideos: (videos: Video[]) => set({ videos }),

  // Expenses
  expenses: [],
  addExpense: (expense: Expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (id: string, updates: Partial<Expense>) =>
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  removeExpense: (id: string) =>
    set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) })),
  setExpenses: (expenses: Expense[]) => set({ expenses }),

  // Loading & Fetch
  isLoading: false,
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  
  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [videosRes, expensesRes, teamRes] = await Promise.all([
        fetch('/api/videos/list'),
        fetch('/api/expenses/list'),
        fetch('/api/team'),
      ]);

      const videos = videosRes.ok ? await videosRes.json() : [];
      const expenses = expensesRes.ok ? await expensesRes.json() : [];
      const teamMembers = teamRes.ok ? await teamRes.json() : [];

      set({ 
        videos: Array.isArray(videos) ? videos : [],
        expenses: Array.isArray(expenses) ? expenses : [],
        teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoading: false });
    }
  },
}));