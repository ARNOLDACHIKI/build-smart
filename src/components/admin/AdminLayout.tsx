import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Search, Building2, LayoutDashboard, Users, FolderKanban, CreditCard, FileText, ScrollText, Brain, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';

const adminMenu = [
  { label: 'Overview', icon: LayoutDashboard, url: '/admin' },
  { label: 'Users', icon: Users, url: '/admin/users' },
  { label: 'Projects', icon: FolderKanban, url: '/admin/projects' },
  { label: 'Subscriptions', icon: CreditCard, url: '/admin/subscriptions' },
  { label: 'Content', icon: FileText, url: '/admin/content' },
  { label: 'Audit Logs', icon: ScrollText, url: '/admin/logs' },
  { label: 'AI Engine', icon: Brain, url: '/admin/ai' },
  { label: 'Settings', icon: Settings, url: '/admin/settings' },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { theme, toggleTheme } = useTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-destructive-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold font-['Space_Grotesk']">Admin</span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenu.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/admin'} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          {!collapsed && <Link to="/" className="ml-auto"><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><LogOut className="w-4 h-4" /></Button></Link>}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

const AdminLayout = () => (
  <SidebarProvider>
    <div className="min-h-screen flex w-full">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center gap-3 border-b border-border px-4 glass">
          <SidebarTrigger />
          <span className="text-sm font-medium text-destructive">ADMIN PANEL</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground text-xs font-bold">A</div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  </SidebarProvider>
);

export default AdminLayout;
