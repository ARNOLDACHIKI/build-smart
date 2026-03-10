import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Award, Gift, TrendingUp, Clock, Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const creditHistory = [
  { action: 'Project Created', credits: +50, date: '2026-03-05' },
  { action: 'Document Uploaded', credits: +10, date: '2026-03-04' },
  { action: 'Team Member Invited', credits: +25, date: '2026-03-03' },
  { action: 'Report Generated', credits: -15, date: '2026-03-02' },
  { action: 'Weekly Login Bonus', credits: +20, date: '2026-03-01' },
  { action: 'Professional Review', credits: +30, date: '2026-02-28' },
  { action: 'AI Insight Used', credits: -10, date: '2026-02-27' },
  { action: 'Referral Bonus', credits: +100, date: '2026-02-25' },
];

const Credits = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('credits.title')}</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('credits.earned'), value: '1,250', icon: Award, color: 'text-primary' },
          { label: t('credits.remaining'), value: '890', icon: Star, color: 'text-primary' },
          { label: 'Level', value: 'Gold', icon: TrendingUp, color: 'text-primary' },
          { label: t('credits.freeTrial'), value: '4 months left', icon: Gift, color: 'text-primary' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="card-3d border-0">
              <CardContent className="p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold font-['Space_Grotesk']">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Credit Score Progress */}
      <Card className="card-3d border-0">
        <CardHeader>
          <CardTitle className="text-base font-['Space_Grotesk']">Credit Score Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Current Level: <span className="text-primary font-medium">Gold</span></span>
                <span className="text-muted-foreground">890 / 1500 to Platinum</span>
              </div>
              <Progress value={59} className="h-3" />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {['Bronze', 'Silver', 'Gold', 'Platinum'].map((level, i) => (
                <div key={i} className={`p-2 rounded-lg text-xs font-medium ${i <= 2 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {i <= 2 && <CheckCircle className="w-3 h-3 mx-auto mb-1" />}
                  {level}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 6-Month Bonus Banner */}
      <Card className="card-3d border-0 gradient-primary">
        <CardContent className="p-6 text-primary-foreground">
          <div className="flex items-center gap-4">
            <Gift className="w-10 h-10" />
            <div>
              <h3 className="text-lg font-bold font-['Space_Grotesk']">6-Month Bonus Credits Active!</h3>
              <p className="text-sm opacity-90">You're earning 2x credits on all activities. This bonus expires in 4 months.</p>
            </div>
            <Badge className="bg-primary-foreground/20 text-primary-foreground ml-auto">2x Multiplier</Badge>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="card-3d border-0">
        <CardHeader>
          <CardTitle className="text-base font-['Space_Grotesk']">Credit History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {creditHistory.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full ${item.credits > 0 ? 'bg-primary' : 'bg-destructive'}`} />
                <span className="text-sm flex-1">{item.action}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{item.date}</span>
                <span className={`text-sm font-medium ${item.credits > 0 ? 'text-primary' : 'text-destructive'}`}>{item.credits > 0 ? '+' : ''}{item.credits}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Credits;
