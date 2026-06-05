// Team member roles and payment splits
export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  paymentPerVideo: number; // in rupees
  email?: string;
  phone?: string;
}

export type TeamRole = 'shoot' | 'edit' | 'smm' | 'ads' | 'client_manager' | 'founder';

export interface Video {
  id: string;
  date: Date;
  title: string;
  description?: string;
  status: 'pending' | 'processing' | 'completed';
  revenue?: number; // legacy / derived
  totalRevenue: number; // ₹500 per video
  shooterPayment: number;
  editorPayment: number;
  smmPayment: number;
  adsPayment: number;
  clientManagerPayment: number;
  companyFund: number;
  createdBy?: string; // optional
  createdAt: Date;
  updatedAt?: Date;
}

export interface PaymentSplit {
  teamMemberId: string;
  teamMemberName: string;
  role: TeamRole;
  amountPerVideo: number;
  videosCount: number;
  totalAmount: number;
}

export interface Expense {
  id: string;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receipt?: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'bank_transfer';
  createdBy: string;
  createdAt: Date;
}

export type ExpenseCategory =
  | 'gadi_petrol'
  | 'khana_food'
  | 'ads'
  | 'internet'
  | 'equipment'
  | 'office_expense'
  | 'other_bills';

export interface DailyReport {
  date: Date;
  totalVideos: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  payments: PaymentSplit[];
  expenses: Expense[];
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalVideos: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  teamEarnings: Record<string, number>;
  expensesByCategory: Record<ExpenseCategory, number>;
  companyFundAccumulated: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: TeamRole;
  isAdmin: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  todayRevenue: number;
  monthlyRevenue: number;
  totalExpenses: number;
  profit: number;
  companyFund: number;
  pendingPayments: number;
  teamCount: number;
  videosThisMonth: number;
}
