import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";

import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import Projects from "./pages/dashboard/Projects";
import ProjectDetail from "./pages/dashboard/ProjectDetail";
import Analytics from "./pages/dashboard/Analytics";
import Reports from "./pages/dashboard/Reports";
import Tasks from "./pages/dashboard/Tasks";
import Documents from "./pages/dashboard/Documents";
import Team from "./pages/dashboard/Team";
import Notifications from "./pages/dashboard/Notifications";
import SettingsPage from "./pages/dashboard/Settings";
import Support from "./pages/dashboard/Support";
import Credits from "./pages/dashboard/Credits";
import CustomerJourney from "./pages/dashboard/CustomerJourney";
import ProfessionalSearch from "./pages/dashboard/ProfessionalSearch";
import Profile from "./pages/dashboard/Profile";

import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import { AdminProjects, AdminSubscriptions, AdminContent, AdminLogs, AdminAI, AdminSettings } from "./pages/admin/AdminPages";

import EngineerLayout from "./components/engineer/EngineerLayout";
import EngineerHome from "./pages/engineer/EngineerHome";
import EngineerInbox from "./pages/engineer/EngineerInbox";
import EngineerNotifications from "./pages/engineer/EngineerNotifications";
import EngineerProjects from "./pages/engineer/EngineerProjects";
import EngineerPortfolio from "./pages/engineer/EngineerPortfolio";
import EngineerAnalytics from "./pages/engineer/EngineerAnalytics";
import EngineerSupport from "./pages/engineer/EngineerSupport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/search" element={<Search />} />

                {/* User Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="projects" element={<Projects />} />
                  <Route path="projects/:id" element={<ProjectDetail />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="documents" element={<Documents />} />
                  <Route path="team" element={<Team />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="support" element={<Support />} />
                  <Route path="credits" element={<Credits />} />
                  <Route path="journey" element={<CustomerJourney />} />
                  <Route path="search" element={<ProfessionalSearch />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Admin Panel */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="subscriptions" element={<AdminSubscriptions />} />
                  <Route path="content" element={<AdminContent />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="ai" element={<AdminAI />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Engineer Panel */}
                <Route
                  path="/engineer"
                  element={
                    <ProtectedRoute>
                      <EngineerLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<EngineerHome />} />
                  <Route path="home" element={<EngineerHome />} />
                  <Route path="inbox" element={<EngineerInbox />} />
                  <Route path="notifications" element={<EngineerNotifications />} />
                  <Route path="projects" element={<EngineerProjects />} />
                  <Route path="portfolio" element={<EngineerPortfolio />} />
                  <Route path="analytics" element={<EngineerAnalytics />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="support" element={<EngineerSupport />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
