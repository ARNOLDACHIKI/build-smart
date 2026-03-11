import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PORTAL_CONFIG } from '@/lib/roles';

const RoleMarketplace = () => {
  const { user } = useAuth();
  const config = ROLE_PORTAL_CONFIG[user?.role || 'USER'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground mt-2">Relevant supply, support, or opportunity flows for this role.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {config.marketplaceFocus.map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle className="text-lg">{item}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">This portal can surface live offers, RFQs, approvals, or engagement opportunities for {user?.role?.toLowerCase().replace(/_/g, ' ')} users.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleMarketplace;
