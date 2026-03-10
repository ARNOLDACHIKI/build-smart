import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, MessageSquare, TrendingUp, Users } from 'lucide-react';

const EngineerAnalytics = () => {
  const cards = [
    { title: 'Inquiry Response Rate', value: '92%', note: '+7% this month', icon: MessageSquare },
    { title: 'Profile Views', value: '1,284', note: '+18% this month', icon: Users },
    { title: 'Project Conversion', value: '34%', note: '+4% this month', icon: TrendingUp },
    { title: 'Average Reply Time', value: '2.1h', note: '-25 min improvement', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Performance insights from inquiries and projects.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
              <Badge variant="secondary" className="mt-2">{card.note}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Most inquiries this month came from Nairobi and Mombasa projects.</p>
          <p>• Highest engagement was on structural and water engineering services.</p>
          <p>• Faster response times strongly correlated with better conversion.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EngineerAnalytics;
