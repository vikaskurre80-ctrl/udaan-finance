# UdaanWorks Finance Dashboard

A premium Apple Clean White themed financial management dashboard for UdaanWorks production company. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

✨ **Phase 1 - Core Features**

- 🔐 **Secure Login** - Team member authentication
- 📊 **Premium Dashboard** - Real-time revenue, expenses, and profit tracking
- 🎥 **Video Logging** - Track ₹500 per video with automatic payment splits
- 💰 **Auto Salary Split** - Automatic payment distribution to team members
- 📝 **Expense Tracking** - 7 expense categories with payment method tracking
- 💼 **Company Fund** - Founder/company fund accumulation tracking
- 📈 **Revenue Analytics** - Monthly trends and detailed reporting
- 👥 **Team Management** - View team members and their earnings
- 📱 **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

## Payment Logic (Per Video = ₹500)

| Role | Amount | Team Member |
|------|--------|-------------|
| Shooter | ₹100 | Vikas, Dhanewar |
| Editor | ₹150 | Aisha |
| SMM | ₹50 | Chitransh Mishra |
| Ads | ₹50 | Anurag |
| Client Manager | ₹50 | Pravin |
| Company Fund | ₹100 | Founder (Vikas) |

## Expense Categories

- Gadi/Petrol
- Khana/Food
- Ads
- Internet
- Equipment
- Office Expense
- Other Bills

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Apple theme
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **HTTP Client**: Axios

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx       # Main layout wrapper
│   ├── Header.tsx       # Top navigation header
│   ├── Sidebar.tsx      # Navigation sidebar
│   ├── StatCard.tsx     # Statistics card component
│   ├── Button.tsx       # Button variants
│   ├── FormInput.tsx    # Form input field
│   └── Alert.tsx        # Alert notifications
├── pages/               # Next.js pages
│   ├── index.tsx        # Home/redirect
│   ├── login.tsx        # Login page
│   ├── dashboard.tsx    # Main dashboard
│   ├── video/
│   │   └── new.tsx      # Add video page
│   ├── expenses.tsx     # Expenses list
│   ├── expenses/
│   │   └── new.tsx      # Add expense page
│   ├── team.tsx         # Team members
│   ├── reports.tsx      # Reports & analytics
│   ├── revenue.tsx      # Revenue tracking
│   ├── settings.tsx     # Settings
│   ├── _app.tsx         # App wrapper
│   └── _document.tsx    # HTML document
├── store/               # State management
│   └── finance.ts       # Zustand finance store
├── types/               # TypeScript types
│   └── index.ts         # All type definitions
├── utils/               # Utility functions
│   ├── calculations.ts  # Finance calculations
│   └── constants.ts     # App constants
└── styles/              # Global styles
    └── globals.css      # Tailwind CSS setup

```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- macOS/Linux/Windows

### Installation

1. **Navigate to project directory**:
   ```bash
   cd /Users/vikaskurre/vikas/udaan\ finance
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

5. **Open in browser**:
   Navigate to `http://localhost:3000`

### Demo Login

The application is in demo mode. Use any email and password to log in:

- **Email**: any@email.com
- **Password**: any password

## Available Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Authentication page |
| Dashboard | `/dashboard` | Main dashboard with analytics |
| Add Video | `/video/new` | Log new video entry |
| Expenses | `/expenses` | View all expenses |
| Add Expense | `/expenses/new` | Record new expense |
| Team | `/team` | View team members |
| Reports | `/reports` | Monthly reports and analytics |
| Settings | `/settings` | App settings |

## Color Scheme (Apple Clean White)

```
Primary: #007AFF (Apple Blue)
Secondary: #5AC8FA (Light Blue)
Success: #34C759 (Green)
Warning: #FF9500 (Orange)
Danger: #FF3B30 (Red)

Background: #FFFFFF (White)
Surface: #F9F9F9 (Light Gray)
Border: #E5E5E5 (Gray)
Text: #000000 (Black)
```

## Features in Detail

### Dashboard
- Today's revenue overview
- Monthly revenue tracking
- Total expenses summary
- Profit analysis with margins
- Company fund accumulation
- Team earnings overview
- Interactive charts and graphs

### Video Logging
- Simple form to log new videos
- Automatic ₹500 revenue assignment
- Visual payment breakdown
- Team member payment preview

### Expense Tracking
- 7 expense categories
- Payment method tracking (Cash, UPI, Card, Bank)
- Expense history with filters
- Category-wise breakdown

### Team Management
- Team member profiles
- Role assignments
- Payment rate display
- Contact information

### Reports
- Monthly financial summary
- Team earnings breakdown
- Expense analysis
- Export functionality (PDF)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Customization

### Adding New Expense Categories

Edit `src/pages/expenses/new.tsx`:

```typescript
const categories = [
  { value: 'new_category', label: 'New Category' },
  // ...
];
```

Also update the type in `src/types/index.ts`:

```typescript
export type ExpenseCategory = 
  | 'new_category'
  | 'existing_categories';
```

### Changing Color Scheme

Edit `src/tailwind.config.ts` to modify theme colors.

## Future Enhancements (Phase 2)

- 🔔 Real-time notifications
- 📱 Mobile app (React Native)
- 💳 Payment gateway integration
- 📊 Advanced analytics
- 🤖 AI-powered insights
- ☁️ Cloud backup
- 🔄 Multi-user collaboration
- 🌐 Multi-currency support

## Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## Performance

- ⚡ Fast page loads with Next.js
- 📦 Optimized bundle size
- 🎯 Responsive images
- ♿ Accessible UI components

## License

© 2026 UdaanWorks. All rights reserved.

## Support

For issues or feature requests, please contact the development team.

---

**Built with ❤️ for UdaanWorks**
