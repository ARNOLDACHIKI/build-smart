import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { assetUrl } from '@/lib/api';
import { getRoleLabel, resolveHomeRoute } from '@/lib/roles';

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const baseRoute = resolveHomeRoute(user?.role);

  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.settings')}</h1>

      <Tabs defaultValue="profile">
        <TabsList className="glass">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card className="card-3d border-0">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <Avatar className="w-16 h-16">
                    <AvatarImage 
                      src={assetUrl(user?.profilePicture)} 
                      alt={user?.name || user?.email} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl">
                      {getInitials(user?.name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div><Button variant="outline" size="sm" onClick={() => navigate(`${baseRoute}/profile`)}>Change Photo</Button></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Full Name</Label><Input value={user?.name || ''} disabled /></div>
                <div className="space-y-2"><Label>Email</Label><Input value={user?.email || ''} disabled /></div>
                <div className="space-y-2"><Label>Phone</Label><Input value={user?.phone || ''} disabled /></div>
                <div className="space-y-2"><Label>Role</Label><Input value={getRoleLabel(user?.role)} disabled /></div>
              </div>
              <Button className="gradient-primary text-primary-foreground" onClick={() => navigate(`${baseRoute}/profile`)}>Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="mt-4">
          <Card className="glass-card border-0">
            <CardContent className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Company Name</Label><Input defaultValue="BuildCo Kenya Ltd" /></div>
                <div className="space-y-2"><Label>Registration No.</Label><Input defaultValue="PVT-2024-XXXXX" /></div>
                <div className="space-y-2"><Label>Address</Label><Input defaultValue="Westlands, Nairobi" /></div>
                <div className="space-y-2"><Label>Industry</Label><Input defaultValue="Construction & Engineering" disabled /></div>
              </div>
              <Button className="gradient-primary text-primary-foreground">{t('common.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="glass-card border-0">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Change Password</h3>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
                <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" /></div>
              </div>
              <Button className="gradient-primary text-primary-foreground">Update Password</Button>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">Two-Factor Authentication</h3><p className="text-sm text-muted-foreground">Add extra security to your account</p></div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 space-y-4">
          <Card className="glass-card border-0">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">Theme</h3><p className="text-sm text-muted-foreground">Switch between light and dark mode</p></div>
                <Button variant="outline" onClick={toggleTheme}>{theme === 'light' ? 'Dark' : 'Light'} Mode</Button>
              </div>
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">Language</h3><p className="text-sm text-muted-foreground">Choose your preferred language</p></div>
                <Select value={language} onValueChange={(v) => setLanguage(v as 'en' | 'sw')}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">Timezone</h3><p className="text-sm text-muted-foreground">Set your local timezone</p></div>
                <Select defaultValue="eat">
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eat">East Africa (EAT)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">Currency</h3><p className="text-sm text-muted-foreground">Default currency for budgets</p></div>
                <Select defaultValue="kes">
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kes">KES (Shilling)</SelectItem>
                    <SelectItem value="usd">USD (Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
