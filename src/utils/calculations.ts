import { Video, PaymentSplit, TeamMember } from '@/types';

const REVENUE_PER_VIDEO = 500;

// Payment split mapping based on role
const PAYMENT_SPLIT: Record<string, number> = {
  shoot: 100,
  edit: 150,
  smm: 50,
  ads: 50,
  client_manager: 50,
  founder: 100, // Company Fund
};

export function calculatePaymentSplit(videos: Video[], teamMembers: TeamMember[]): PaymentSplit[] {
  return teamMembers.map((member) => ({
    teamMemberId: member.id,
    teamMemberName: member.name,
    role: member.role,
    amountPerVideo: PAYMENT_SPLIT[member.role],
    videosCount: videos.length,
    totalAmount: videos.length * PAYMENT_SPLIT[member.role],
  }));
}

export function calculateDailyRevenue(videos: Video[]): number {
  return videos.length * REVENUE_PER_VIDEO;
}

export function calculateProfit(revenue: number, expenses: number): number {
  return revenue - expenses;
}

export function calculateCompanyFund(videosCount: number): number {
  return videosCount * PAYMENT_SPLIT.founder;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function getExpenseCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    gadi_petrol: 'Gadi/Petrol',
    GADI_PETROL: 'Gadi/Petrol',
    khana_food: 'Khana/Food',
    KHANA_FOOD: 'Khana/Food',
    ads: 'Ads',
    ADS: 'Ads',
    internet: 'Internet',
    INTERNET: 'Internet',
    equipment: 'Equipment',
    EQUIPMENT: 'Equipment',
    office_expense: 'Office Expense',
    OFFICE_EXPENSE: 'Office Expense',
    other_bills: 'Other Bills',
    OTHER_BILLS: 'Other Bills',
  };
  return labels[category] || category;
}

// Distribute per-video payments (from video records) across team members who share the same role.
export function distributeVideoPayments(videos: Video[], teamMembers: TeamMember[]) {
  const totals = {
    shoot: videos.reduce((acc, v) => acc + (v.shooterPayment || 0), 0),
    edit: videos.reduce((acc, v) => acc + (v.editorPayment || 0), 0),
    smm: videos.reduce((acc, v) => acc + (v.smmPayment || 0), 0),
    ads: videos.reduce((acc, v) => acc + (v.adsPayment || 0), 0),
    client_manager: videos.reduce((acc, v) => acc + (v.clientManagerPayment || 0), 0),
    founder: videos.reduce((acc, v) => acc + (v.companyFund || 0), 0),
  };

  const counts: Record<string, number> = {};
  teamMembers.forEach((m) => {
    counts[m.role] = (counts[m.role] || 0) + 1;
  });

  return teamMembers.map((m) => {
    const totalForRole = totals[m.role] || 0;
    const count = counts[m.role] || 1;
    const share = Math.round(totalForRole / count);
    return {
      teamMemberId: m.id,
      teamMemberName: m.name,
      role: m.role,
      totalAmount: share,
    };
  });
}
