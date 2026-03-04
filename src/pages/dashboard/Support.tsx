import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle, Mail, Phone, FileText } from 'lucide-react';

const Support = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.support')}</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="glass-card border-0">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold">Contact Support</h3>
              <div className="space-y-2"><Input placeholder="Subject" /></div>
              <div className="space-y-2"><Textarea placeholder="Describe your issue..." rows={5} /></div>
              <Button className="gradient-primary text-primary-foreground">Send Message</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {[
            { icon: MessageCircle, title: 'Live Chat', desc: 'Chat with our support team', action: 'Start Chat' },
            { icon: Mail, title: 'Email', desc: 'support@buildsmart.ke', action: 'Send Email' },
            { icon: Phone, title: 'Phone', desc: '+254 20 XXX XXXX', action: 'Call Now' },
            { icon: FileText, title: 'Documentation', desc: 'Browse help articles', action: 'View Docs' },
          ].map((item, i) => (
            <Card key={i} className="glass-card border-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><item.icon className="w-5 h-5 text-primary" /></div>
                <div className="flex-1"><div className="text-sm font-medium">{item.title}</div><div className="text-xs text-muted-foreground">{item.desc}</div></div>
                <Button size="sm" variant="outline">{item.action}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
