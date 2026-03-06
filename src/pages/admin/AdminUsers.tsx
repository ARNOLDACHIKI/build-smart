import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Ban, Trash2, ArrowUpCircle, Key, Eye } from 'lucide-react';

const users = [
  { name: 'James Kariuki', company: 'BuildCo Kenya', role: 'PM', status: 'active', plan: 'Pro', joined: '2025-11-15' },
  { name: 'Amina Hassan', company: 'CoastBuild Ltd', role: 'Engineer', status: 'active', plan: 'Pro', joined: '2025-12-01' },
  { name: 'Peter Odhiambo', company: 'Lake Builders', role: 'Contractor', status: 'active', plan: 'Free', joined: '2026-01-10' },
  { name: 'Sarah Mwangi', company: 'DesignArch', role: 'Architect', status: 'suspended', plan: 'Pro', joined: '2026-01-20' },
  { name: 'David Njeru', company: 'Highland Const.', role: 'PM', status: 'active', plan: 'Enterprise', joined: '2025-10-05' },
  { name: 'Grace Wanjiku', company: 'Nairobi Devs', role: 'Engineer', status: 'active', plan: 'Free', joined: '2026-02-15' },
];

const AdminUsers = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold font-['Space_Grotesk']">Users Management</h1>
      <Badge variant="secondary">{users.length} total</Badge>
    </div>

    <div className="relative max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input placeholder="Search users..." className="pl-9" />
    </div>

    <Card className="card-3d border-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-sm">{u.company}</TableCell>
                <TableCell><Badge variant="secondary" className="text-xs">{u.role}</Badge></TableCell>
                <TableCell><Badge variant="secondary" className={u.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>{u.status}</Badge></TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{u.plan}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.joined}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Activity</DropdownMenuItem>
                      <DropdownMenuItem><ArrowUpCircle className="w-4 h-4 mr-2" /> Upgrade Plan</DropdownMenuItem>
                      <DropdownMenuItem><Key className="w-4 h-4 mr-2" /> Reset Password</DropdownMenuItem>
                      <DropdownMenuItem><Ban className="w-4 h-4 mr-2" /> Suspend</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default AdminUsers;
