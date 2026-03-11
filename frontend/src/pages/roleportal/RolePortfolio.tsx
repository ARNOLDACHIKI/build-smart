import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PORTAL_CONFIG } from '@/lib/roles';

const RolePortfolio = () => {
  const { user } = useAuth();
  const config = ROLE_PORTAL_CONFIG[user?.role || 'USER'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Portfolio</h1>
        <p className="text-muted-foreground mt-2">Role-specific capabilities and work history for {config.title.toLowerCase()}.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {config.portfolioItems.map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle className="text-lg">{item}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section is tailored to the role and can be expanded with documents, metrics, samples, approvals, or certifications.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RolePortfolio;
