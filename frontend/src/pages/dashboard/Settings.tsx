import { useEffect, useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { assetUrl, apiUrl } from '@/lib/api';
import { getRoleLabel, resolveHomeRoute } from '@/lib/roles';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

type ProjectReminderFrequency = 'daily' | 'weekly';

type ProjectReminderSettings = {
  enabled: boolean;
  frequency: ProjectReminderFrequency;
  quietHoursStart: number;
  quietHoursEnd: number;
};

const DEFAULT_PROJECT_REMINDER_SETTINGS: ProjectReminderSettings = {
  enabled: true,
  frequency: 'daily',
  quietHoursStart: 22,
  quietHoursEnd: 7,
};

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour);

const formatHourLabel = (hour: number): string => {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:00 ${suffix}`;
};

const SettingsPage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const baseRoute = resolveHomeRoute(user?.role);
  const [isUpdatingTwoFactor, setIsUpdatingTwoFactor] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [projectReminderSettings, setProjectReminderSettings] = useState<ProjectReminderSettings>(DEFAULT_PROJECT_REMINDER_SETTINGS);
  const [isLoadingProjectReminderSetting, setIsLoadingProjectReminderSetting] = useState(false);
  const [isUpdatingProjectReminderSetting, setIsUpdatingProjectReminderSetting] = useState(false);

  const [companyFormData, setCompanyFormData] = useState({
    companyName: user?.company || '',
    registrationNo: user?.registrationNo || '',
    address: user?.location || '',
    industry: user?.industry || 'Construction & Engineering',
  });

  const twoFactorEnabled = Boolean(user?.twoFactorEnabled);

  useEffect(() => {
    setCompanyFormData({
      companyName: user?.company || '',
      registrationNo: user?.registrationNo || '',
      address: user?.location || '',
      industry: user?.industry || 'Construction & Engineering',
    });
  }, [user?.company, user?.registrationNo, user?.location, user?.industry]);

  useEffect(() => {
    if (!token) return;

    const loadProjectReminderSettings = async () => {
      setIsLoadingProjectReminderSetting(true);
      try {
        const response = await fetch(apiUrl('/api/notifications/project-reminders/settings'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load project reminder settings');
        }

        const data = await response.json();
        setProjectReminderSettings({
          enabled: Boolean(data?.enabled),
          frequency: data?.frequency === 'weekly' ? 'weekly' : 'daily',
          quietHoursStart:
            Number.isInteger(data?.quietHoursStart) && data.quietHoursStart >= 0 && data.quietHoursStart <= 23
              ? data.quietHoursStart
              : DEFAULT_PROJECT_REMINDER_SETTINGS.quietHoursStart,
          quietHoursEnd:
            Number.isInteger(data?.quietHoursEnd) && data.quietHoursEnd >= 0 && data.quietHoursEnd <= 23
              ? data.quietHoursEnd
              : DEFAULT_PROJECT_REMINDER_SETTINGS.quietHoursEnd,
        });
      } catch (error) {
        console.error('Failed to load project reminder settings', error);
      } finally {
        setIsLoadingProjectReminderSetting(false);
      }
    };

    void loadProjectReminderSettings();
  }, [token]);

  const handleCompanyFieldChange = (field: keyof typeof companyFormData, value: string) => {
    setCompanyFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompanySave = async () => {
    if (!token || !user) {
      toast.error('You need to be signed in to update company settings');
      return;
    }

    if (!companyFormData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    if (!companyFormData.address.trim()) {
      toast.error('Address is required');
      return;
    }

    setIsSavingCompany(true);

    try {
      const response = await fetch(apiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: companyFormData.companyName.trim(),
          registrationNo: companyFormData.registrationNo.trim(),
          industry: companyFormData.industry.trim(),
          location: companyFormData.address.trim(),
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update company profile';
        try {
          const errorBody = await response.json();
          if (typeof errorBody?.error === 'string' && errorBody.error.trim()) {
            errorMessage = errorBody.error;
          }
        } catch {
          // Ignore malformed error bodies and keep the default message.
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      updateUser(data.user);

      if (data?.mode === 'offline') {
        toast.success('Company settings saved (offline mode)');
      } else {
        toast.success('Company settings saved');
      }
    } catch (error) {
      console.error('Company settings update error:', error);
      const message = error instanceof Error ? error.message : 'Failed to save company settings';
      toast.error(message);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (!token || !user) {
      toast.error('You need to be signed in to change security settings');
      return;
    }

    setIsUpdatingTwoFactor(true);
    try {
      const response = await fetch(apiUrl('/api/auth/profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ twoFactorEnabled: enabled }),
      });

      if (!response.ok) {
        throw new Error('Failed to update two-factor settings');
      }

      const data = await response.json();
      updateUser(data.user);
      toast.success(enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled');
    } catch (error) {
      console.error('Two-factor update error:', error);
      toast.error('Failed to update two-factor authentication');
    } finally {
      setIsUpdatingTwoFactor(false);
    }
  };

  const updateProjectReminderSettings = async (patch: Partial<ProjectReminderSettings>) => {
    if (!token) {
      toast.error('You need to be signed in to update reminder settings');
      return;
    }

    const previousSettings = projectReminderSettings;
    const nextSettings = { ...projectReminderSettings, ...patch };

    setProjectReminderSettings(nextSettings);
    setIsUpdatingProjectReminderSetting(true);

    try {
      const response = await fetch(apiUrl('/api/notifications/project-reminders/settings'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });

      if (!response.ok) {
        throw new Error('Failed to update project reminder setting');
      }

      const data = await response.json();
      setProjectReminderSettings({
        enabled: Boolean(data?.enabled),
        frequency: data?.frequency === 'weekly' ? 'weekly' : 'daily',
        quietHoursStart:
          Number.isInteger(data?.quietHoursStart) && data.quietHoursStart >= 0 && data.quietHoursStart <= 23
            ? data.quietHoursStart
            : nextSettings.quietHoursStart,
        quietHoursEnd:
          Number.isInteger(data?.quietHoursEnd) && data.quietHoursEnd >= 0 && data.quietHoursEnd <= 23
            ? data.quietHoursEnd
            : nextSettings.quietHoursEnd,
      });

      if (typeof patch.enabled === 'boolean') {
        toast.success(patch.enabled ? 'Project reminder emails enabled' : 'Project reminder emails disabled');
      }
    } catch (error) {
      console.error('Project reminder update error:', error);
      setProjectReminderSettings(previousSettings);
      toast.error('Failed to update project reminder setting');
    } finally {
      setIsUpdatingProjectReminderSetting(false);
    }
  };

  const handleProjectReminderToggle = async (enabled: boolean) => {
    await updateProjectReminderSettings({ enabled });
  };

  const handleProjectReminderFrequencyChange = async (frequency: ProjectReminderFrequency) => {
    await updateProjectReminderSettings({ frequency });
  };

  const handleProjectReminderQuietStartChange = async (value: string) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 23) return;
    await updateProjectReminderSettings({ quietHoursStart: parsed });
  };

  const handleProjectReminderQuietEndChange = async (value: string) => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 23) return;
    await updateProjectReminderSettings({ quietHoursEnd: parsed });
  };

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
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={companyFormData.companyName}
                    onChange={(event) => handleCompanyFieldChange('companyName', event.target.value)}
                    placeholder="BuildCo Kenya Ltd"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-registration">Registration No.</Label>
                  <Input
                    id="company-registration"
                    value={companyFormData.registrationNo}
                    onChange={(event) => handleCompanyFieldChange('registrationNo', event.target.value)}
                    placeholder="PVT-2024-XXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-address">Address</Label>
                  <Input
                    id="company-address"
                    value={companyFormData.address}
                    onChange={(event) => handleCompanyFieldChange('address', event.target.value)}
                    placeholder="Westlands, Nairobi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-industry">Industry</Label>
                  <Input
                    id="company-industry"
                    value={companyFormData.industry}
                    onChange={(event) => handleCompanyFieldChange('industry', event.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                className="gradient-primary text-primary-foreground"
                onClick={() => void handleCompanySave()}
                disabled={isSavingCompany}
              >
                {isSavingCompany ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('common.save')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div><h3 className="font-semibold">Two-Factor Authentication</h3><p className="text-sm text-muted-foreground">Add extra security to your account</p></div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={(checked) => void handleTwoFactorToggle(checked)}
                  disabled={isUpdatingTwoFactor}
                />
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Project Attention Email Reminders</h3>
                  <p className="text-sm text-muted-foreground">Get email alerts when your projects fall into attention-needed status.</p>
                </div>
                <Switch
                  checked={projectReminderSettings.enabled}
                  onCheckedChange={(checked) => void handleProjectReminderToggle(checked)}
                  disabled={isLoadingProjectReminderSetting || isUpdatingProjectReminderSetting}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Reminder Frequency</h3>
                  <p className="text-sm text-muted-foreground">Choose how often reminder emails can be sent.</p>
                </div>
                <Select
                  value={projectReminderSettings.frequency}
                  onValueChange={(value) => void handleProjectReminderFrequencyChange(value as ProjectReminderFrequency)}
                  disabled={isLoadingProjectReminderSetting || isUpdatingProjectReminderSetting || !projectReminderSettings.enabled}
                >
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quiet Hours Start</Label>
                  <Select
                    value={String(projectReminderSettings.quietHoursStart)}
                    onValueChange={(value) => void handleProjectReminderQuietStartChange(value)}
                    disabled={isLoadingProjectReminderSetting || isUpdatingProjectReminderSetting || !projectReminderSettings.enabled}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HOUR_OPTIONS.map((hour) => (
                        <SelectItem key={`quiet-start-${hour}`} value={String(hour)}>
                          {formatHourLabel(hour)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quiet Hours End</Label>
                  <Select
                    value={String(projectReminderSettings.quietHoursEnd)}
                    onValueChange={(value) => void handleProjectReminderQuietEndChange(value)}
                    disabled={isLoadingProjectReminderSetting || isUpdatingProjectReminderSetting || !projectReminderSettings.enabled}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {HOUR_OPTIONS.map((hour) => (
                        <SelectItem key={`quiet-end-${hour}`} value={String(hour)}>
                          {formatHourLabel(hour)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
