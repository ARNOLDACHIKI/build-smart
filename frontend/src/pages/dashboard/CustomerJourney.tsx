import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Eye, UserPlus, Briefcase, Heart, ArrowRight, CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const stages = [
  {
    name: 'Discovery',
    nameKey: 'journey.discovery',
    icon: Eye,
    status: 'completed',
    progress: 100,
    steps: [
      { text: 'Visited landing page', done: true },
      { text: 'Explored features', done: true },
      { text: 'Searched professionals', done: true },
    ],
  },
  {
    name: 'Onboarding',
    nameKey: 'journey.onboarding',
    icon: UserPlus,
    status: 'completed',
    progress: 100,
    steps: [
      { text: 'Created account', done: true },
      { text: 'Completed profile', done: true },
      { text: 'Invited team members', done: true },
    ],
  },
  {
    name: 'Engagement',
    nameKey: 'journey.engagement',
    icon: Briefcase,
    status: 'active',
    progress: 65,
    steps: [
      { text: 'Created first project', done: true },
      { text: 'Used AI insights', done: true },
      { text: 'Generated first report', done: false },
      { text: 'Connected with professionals', done: false },
    ],
  },
  {
    name: 'Retention',
    nameKey: 'journey.retention',
    icon: Heart,
    status: 'upcoming',
    progress: 0,
    steps: [
      { text: 'Upgrade to Pro plan', done: false },
      { text: 'Achieve Platinum status', done: false },
      { text: 'Refer 3 colleagues', done: false },
    ],
  },
];

const CustomerJourney = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('journey.title')}</h1>

      {/* Journey timeline */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              stage.status === 'completed' ? 'bg-primary/10 text-primary' :
              stage.status === 'active' ? 'gradient-primary text-primary-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              <stage.icon className="w-4 h-4" />
              {t(stage.nameKey)}
            </div>
            {i < stages.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Stage cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {stages.map((stage, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`card-3d border-0 ${stage.status === 'active' ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-['Space_Grotesk'] flex items-center gap-2">
                    <stage.icon className={`w-5 h-5 ${stage.status === 'completed' ? 'text-primary' : stage.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                    {t(stage.nameKey)}
                  </CardTitle>
                  <Badge variant="secondary" className={
                    stage.status === 'completed' ? 'bg-primary/10 text-primary' :
                    stage.status === 'active' ? 'bg-primary/10 text-primary' :
                    ''
                  }>{stage.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={stage.progress} className="h-2 mb-4" />
                <div className="space-y-2">
                  {stage.steps.map((step, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      {step.done ? (
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={step.done ? '' : 'text-muted-foreground'}>{step.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CustomerJourney;
