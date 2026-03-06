import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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

import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import { AdminProjects, AdminSubscriptions, AdminContent, AdminLogs, AdminAI, AdminSettings } from "./pages/admin/AdminPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
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
              <Route path="/dashboard" element={<DashboardLayout />}>
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
              </Route>

              {/* Admin Panel */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="logs" element={<AdminLogs />} />
                <Route path="ai" element={<AdminAI />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
