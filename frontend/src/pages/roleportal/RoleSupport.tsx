import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getRoleLabel } from '@/lib/roles';

const RoleSupport = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground mt-2">Get help for your {getRoleLabel(user?.role).toLowerCase()} workflow, approvals, or collaboration needs.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Submit support request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <Input placeholder="Support request subject" />
          <Textarea rows={6} placeholder="Describe the issue, workflow blocker, or support you need." />
          <Button className="gradient-primary text-primary-foreground">Send support request</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSupport;
