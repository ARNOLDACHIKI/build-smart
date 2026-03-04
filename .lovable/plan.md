

# BuildSmart Kenya — Construction Management Platform

## Design Vision
Futuristic green & teal theme with glassmorphism effects, smooth animations, and both light/dark mode. Clean dashboard layouts with data visualization throughout. Language toggle for English ↔ Swahili.

---

## Phase 1: Public Pages

### Landing Page
- Hero section with animated construction visuals, CTA "Start Free Trial"
- Features grid (6 key features with icons)
- How It Works (3-step process)
- Testimonials carousel
- Pricing cards (Free / Pro / Enterprise)
- Footer with links
- Navbar with Login, Sign Up, Book Demo buttons
- Language switcher (EN/SW) in navbar

### Login Page
- Email, password, remember me checkbox
- Forgot Password link, Sign Up link
- Social login buttons (Google)

### Register Page
- Full Name, Company Name, Role dropdown (Contractor, Engineer, Architect, PM), Email, Password, Confirm Password
- "Login instead" link

---

## Phase 2: User Dashboard (Sidebar Layout)

### Sidebar Navigation
Collapsible sidebar with icons: Dashboard, Projects, Analytics, Reports, Tasks, Documents, Team, Notifications, Settings, Support. Dark/Light mode toggle and Language switcher in sidebar footer.

### Dashboard Page
- Stats cards: Active Projects, Budget Usage, Tasks Due, Risk Alerts
- Budget usage chart (bar), Timeline status chart (line), Recent activity feed
- AI Insights panel with personalized recommendations
- Quick action buttons: Create Project, View Analytics, Generate Report

### Projects Page
- Table with columns: Name, Status badge, Budget, Deadline, Progress bar
- Buttons: New Project, Edit, Delete, Archive, Duplicate
- Search and filter controls

### Project Detail Page
- Tabbed interface: Overview, Budget, Timeline (Gantt-style), Tasks, Files, Team, Risk Analysis, Insights
- Budget tracking with deviation alerts
- Milestone management
- File upload area
- Task assignment

### Analytics Page
- Cost Overruns line chart
- Delay predictions bar chart
- Labor productivity metrics
- Cash flow forecasting
- Resource usage heat map
- Filter by date, Export PDF, Compare Projects buttons

### Reports Page
- Generate reports: Financial, Timeline, Risk, Compliance
- Download as PDF/Excel
- Schedule auto-reports
- Report history list

### Tasks Page
- Kanban board: To Do → In Progress → Completed
- Drag indicators (visual only in phase 1)
- Add Task modal with assignment, priority, due date

### Documents Page
- File list with categories and version indicators
- Upload, Rename, Share, Delete, Download actions
- Grid/List view toggle

### Team Page
- Team member cards with roles and permissions
- Invite Member modal
- Change Role, Remove, Assign to Project actions

### Notifications Page
- Alert list: Risk warnings, Budget overruns, Deadline reminders
- Notification preferences toggles (Email, SMS, Push)

### Settings Page
- Sections: Profile, Company Info, Security (2FA, change password), Preferences (theme, timezone, currency, language)

---

## Phase 3: Admin Panel

### Admin Dashboard (separate layout/route prefix `/admin`)
- Overview: Total users, active users, revenue, project volume, system health indicators
- Users Management table with suspend, delete, upgrade, reset password actions
- Projects Monitoring with risk pattern detection
- Subscription Management with plan configuration
- Content Management (FAQs, help articles)
- Audit Logs: login logs, data changes, API usage, error logs
- AI Engine Control panel (threshold adjustments, model status)
- System Settings

---

## Phase 4 (Future): Backend Integration
- Connect Supabase for auth, database, and storage
- Core tables: users, companies, projects, tasks, milestones, budgets, files, teams, logs, insights, subscriptions, notifications
- RLS policies and role-based access
- Edge functions for report generation and AI insights

---

## Technical Notes
- All pages built with mock/sample data initially
- Recharts for all data visualizations
- i18n setup with English and Swahili translations
- Responsive design (mobile + desktop)
- Smooth page transitions and micro-animations

