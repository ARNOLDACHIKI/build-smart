import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PORTAL_CONFIG } from '@/lib/roles';

const RoleTasks = () => {
  const { user } = useAuth();
  const config = ROLE_PORTAL_CONFIG[user?.role || 'USER'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tasks</h1>
        <p className="text-muted-foreground mt-2">Operational tasks aligned to this role’s construction responsibilities.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Task board</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.tasks.map((task) => (
            <div key={task} className="flex items-start gap-3 rounded-lg border p-3">
              <Checkbox />
              <div>
                <p className="font-medium">{task}</p>
                <p className="text-sm text-muted-foreground">Generated from the role workflow profile for this portal.</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleTasks;
