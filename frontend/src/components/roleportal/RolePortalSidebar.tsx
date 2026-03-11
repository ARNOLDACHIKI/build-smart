import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Bell,
  Briefcase,
  CheckSquare,
  Store,
  Users,
  User,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { assetUrl } from '@/lib/api';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';
import { useTheme } from '@/contexts/ThemeContext';
import { getRoleLabel } from '@/lib/roles';

const menuItems = [
  { label: 'Overview', icon: LayoutDashboard, url: '/portal' },
  { label: 'Inbox', icon: Inbox, url: '/portal/inbox' },
  { label: 'Notifications', icon: Bell, url: '/portal/notifications' },
  { label: 'Portfolio', icon: Briefcase, url: '/portal/portfolio' },
  { label: 'Tasks', icon: CheckSquare, url: '/portal/tasks' },
  { label: 'Marketplace', icon: Store, url: '/portal/marketplace' },
  { label: 'Network', icon: Users, url: '/portal/network' },
  { label: 'Profile', icon: User, url: '/portal/profile' },
  { label: 'Settings', icon: Settings, url: '/portal/settings' },
  { label: 'Support', icon: HelpCircle, url: '/portal/support' },
];

type RolePortalSidebarProps = {
  unreadRepliesCount?: number;
};

const RolePortalSidebar = ({ unreadRepliesCount = 0 }: RolePortalSidebarProps) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const initials = user?.name
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
    : (user?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/portal" className="flex items-center gap-2">
          <img src={theme === 'dark' ? logoDark : logoLight} alt="ICDBO" className="h-8 w-auto" />
          {!collapsed && <span className="font-semibold">{getRoleLabel(user?.role)}</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/portal'} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <div className="relative mr-2">
                        <item.icon className="h-4 w-4" />
                        {collapsed && item.url === '/portal/notifications' && unreadRepliesCount > 0 && (
                          <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      {!collapsed && (
                        <div className="flex w-full items-center justify-between gap-2">
                          <span>{item.label}</span>
                          {item.url === '/portal/notifications' && unreadRepliesCount > 0 && (
                            <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px]">
                              {unreadRepliesCount}
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-3">
        {!collapsed && (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar>
              <AvatarImage src={assetUrl(user?.profilePicture)} alt={user?.name || user?.email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Portal User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className="justify-start text-destructive hover:text-destructive"
          onClick={() => {
            logout();
            navigate('/login', { replace: true });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && 'Logout'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default RolePortalSidebar;
