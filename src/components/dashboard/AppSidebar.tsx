import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, BarChart3, FileText, CheckSquare,
  FileArchive, Users, Bell, Settings, HelpCircle, Sun, Moon, Globe,
  Building2, LogOut, ChevronLeft
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
  SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';

const menuItems = [
  { key: 'sidebar.dashboard', icon: LayoutDashboard, url: '/dashboard' },
  { key: 'sidebar.projects', icon: FolderKanban, url: '/dashboard/projects' },
  { key: 'sidebar.analytics', icon: BarChart3, url: '/dashboard/analytics' },
  { key: 'sidebar.reports', icon: FileText, url: '/dashboard/reports' },
  { key: 'sidebar.tasks', icon: CheckSquare, url: '/dashboard/tasks' },
  { key: 'sidebar.documents', icon: FileArchive, url: '/dashboard/documents' },
  { key: 'sidebar.team', icon: Users, url: '/dashboard/team' },
  { key: 'sidebar.notifications', icon: Bell, url: '/dashboard/notifications' },
  { key: 'sidebar.settings', icon: Settings, url: '/dashboard/settings' },
  { key: 'sidebar.support', icon: HelpCircle, url: '/dashboard/support' },
];

const AppSidebar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-lg font-bold font-['Space_Grotesk'] gradient-text">BuildSmart</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/dashboard'} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{t(item.key)}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')} className="h-8 w-8 relative">
            <Globe className="w-4 h-4" />
            {!collapsed && <span className="absolute -bottom-1 -right-0.5 text-[9px] font-bold text-primary">{language.toUpperCase()}</span>}
          </Button>
          {!collapsed && (
            <Link to="/" className="ml-auto">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <LogOut className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
