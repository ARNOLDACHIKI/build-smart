import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, AlertTriangle, Wallet, Clock, Check } from 'lucide-react';

const notifications = [
  { text: 'Mombasa Road Project budget exceeded by 8%', type: 'warning', time: '2 hours ago', read: false, icon: Wallet },
  { text: 'Risk level increased on Kisumu Bridge project', type: 'danger', time: '4 hours ago', read: false, icon: AlertTriangle },
  { text: 'Nairobi Tower Phase 3 milestone completed', type: 'success', time: '6 hours ago', read: false, icon: Check },
  { text: 'Deadline approaching: Thika Highway review due in 3 days', type: 'info', time: '1 day ago', read: true, icon: Clock },
  { text: 'New team member Sarah Mwangi joined Eldoret Park project', type: 'info', time: '2 days ago', read: true, icon: Bell },
];

const typeColors = { warning: 'text-accent', danger: 'text-destructive', success: 'text-primary', info: 'text-muted-foreground' };

const Notifications = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.notifications')}</h1>
        <Button size="sm" variant="outline">Mark all read</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {notifications.map((n, i) => (
            <Card key={i} className={`glass-card border-0 ${!n.read ? 'ring-1 ring-primary/20' : 'opacity-70'}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <n.icon className={`w-5 h-5 mt-0.5 ${typeColors[n.type as keyof typeof typeColors]}`} />
                <div className="flex-1">
                  <p className="text-sm">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card border-0 h-fit">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Notification Preferences</h3>
            <div className="space-y-3">
              {[{ label: 'Email Notifications', key: 'email' }, { label: 'SMS Notifications', key: 'sms' }, { label: 'Push Notifications', key: 'push' }, { label: 'Risk Alerts', key: 'risk' }, { label: 'Budget Alerts', key: 'budget' }].map((pref) => (
                <div key={pref.key} className="flex items-center justify-between">
                  <Label className="text-sm">{pref.label}</Label>
                  <Switch defaultChecked={pref.key !== 'sms'} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;
