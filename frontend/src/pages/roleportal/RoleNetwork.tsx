import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PORTAL_CONFIG } from '@/lib/roles';

const RoleNetwork = () => {
  const { user } = useAuth();
  const config = ROLE_PORTAL_CONFIG[user?.role || 'USER'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Network</h1>
        <p className="text-muted-foreground mt-2">Key stakeholders this role should collaborate with inside ICDBO.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Relationship map</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {config.networkFocus.map((item) => (
            <div key={item} className="rounded-lg border p-4">
              <p className="font-medium">{item}</p>
              <p className="text-sm text-muted-foreground mt-2">Suggested collaboration lane for this role’s portal workflow.</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleNetwork;
