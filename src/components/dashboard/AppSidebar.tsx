import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, BarChart3, FileText, CheckSquare,
  FileArchive, Users, Bell, Settings, HelpCircle, Sun, Moon, Globe,
  LogOut, Award, Map, Search
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
  SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

const menuItems = [
  { key: 'sidebar.dashboard', icon: LayoutDashboard, url: '/dashboard' },
  { key: 'sidebar.projects', icon: FolderKanban, url: '/dashboard/projects' },
  { key: 'sidebar.analytics', icon: BarChart3, url: '/dashboard/analytics' },
  { key: 'sidebar.reports', icon: FileText, url: '/dashboard/reports' },
  { key: 'sidebar.tasks', icon: CheckSquare, url: '/dashboard/tasks' },
  { key: 'sidebar.documents', icon: FileArchive, url: '/dashboard/documents' },
  { key: 'sidebar.team', icon: Users, url: '/dashboard/team' },
  { key: 'sidebar.search', icon: Search, url: '/dashboard/search' },
  { key: 'sidebar.credits', icon: Award, url: '/dashboard/credits' },
  { key: 'sidebar.journey', icon: Map, url: '/dashboard/journey' },
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
          <img src={theme === 'dark' ? logoDark : logoLight} alt="ICDBO" className="h-8 w-auto" />
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
        {!collapsed && (
          <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'sw')}>
            <SelectTrigger className="h-8 text-xs">
              <Globe className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="sw">Kiswahili</SelectItem>
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
          {collapsed && (
            <Button variant="ghost" size="icon" onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')} className="h-8 w-8">
              <Globe className="w-4 h-4" />
            </Button>
          )}
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
