import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Mail, MoreHorizontal, Shield, UserX } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const members = [
  { name: 'James Kariuki', email: 'james@buildco.ke', role: 'Project Manager', projects: 4, avatar: 'JK' },
  { name: 'Amina Hassan', email: 'amina@buildco.ke', role: 'Civil Engineer', projects: 3, avatar: 'AH' },
  { name: 'Peter Odhiambo', email: 'peter@buildco.ke', role: 'Contractor', projects: 5, avatar: 'PO' },
  { name: 'Sarah Mwangi', email: 'sarah@buildco.ke', role: 'Architect', projects: 2, avatar: 'SM' },
  { name: 'David Njeru', email: 'david@buildco.ke', role: 'Site Supervisor', projects: 3, avatar: 'DN' },
  { name: 'Grace Wanjiku', email: 'grace@buildco.ke', role: 'QS Engineer', projects: 4, avatar: 'GW' },
];

const Team = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.team')}</h1>
        <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Invite Member</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m, i) => (
          <Card key={i} className="glass-card border-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{m.avatar}</div>
                  <div>
                    <div className="font-medium text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Shield className="w-4 h-4 mr-2" /> Change Role</DropdownMenuItem>
                    <DropdownMenuItem><Mail className="w-4 h-4 mr-2" /> Send Message</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive"><UserX className="w-4 h-4 mr-2" /> Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="secondary">{m.role}</Badge>
                <span className="text-xs text-muted-foreground">{m.projects} projects</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Team;
