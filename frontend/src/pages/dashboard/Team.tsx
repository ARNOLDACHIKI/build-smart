import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Mail, MoreHorizontal, Shield, UserX } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiUrl } from '@/lib/api';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  projects: number;
  avatar: string;
};

const ROLE_OPTIONS = [
  'Project Manager',
  'Civil Engineer',
  'Contractor',
  'Architect',
  'Site Supervisor',
  'QS Engineer',
  'Technician',
];

const Team = () => {
  const { t } = useLanguage();
  const { token } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: ROLE_OPTIONS[0],
  });
  const [newRole, setNewRole] = useState(ROLE_OPTIONS[0]);

  const loadMembers = useCallback(async () => {
    if (!token) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl('/api/team-members'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to load team members');
      }

      const data = (await response.json()) as TeamMember[];
      setMembers(data);
    } catch (error) {
      console.error('Load team members error:', error);
      const message = error instanceof Error ? error.message : 'Failed to load team members';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const totalProjects = useMemo(
    () => members.reduce((sum, member) => sum + member.projects, 0),
    [members],
  );

  const openRoleDialog = (member: TeamMember) => {
    setActiveMember(member);
    setNewRole(member.role);
    setChangeRoleOpen(true);
  };

  const openRemoveDialog = (member: TeamMember) => {
    setActiveMember(member);
    setRemoveOpen(true);
  };

  const handleInvite = async () => {
    const name = inviteForm.name.trim();
    const email = inviteForm.email.trim().toLowerCase();
    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }
    if (!token) {
      toast.error('You need to be signed in');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(apiUrl('/api/team-members'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          role: inviteForm.role,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to invite member');
      }

      const created = (await response.json()) as TeamMember;
      setMembers((prev) => [created, ...prev]);
      setInviteOpen(false);
      setInviteForm({ name: '', email: '', role: ROLE_OPTIONS[0] });
      toast.success(`Invited ${name}`);
    } catch (error) {
      console.error('Invite member error:', error);
      const message = error instanceof Error ? error.message : 'Failed to invite member';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeRole = async () => {
    if (!activeMember) return;
    if (!token) {
      toast.error('You need to be signed in');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(apiUrl(`/api/team-members/${activeMember.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to update role');
      }

      const updated = (await response.json()) as TeamMember;
      setMembers((prev) =>
        prev.map((member) => (member.id === activeMember.id ? updated : member)),
      );
      setChangeRoleOpen(false);
      toast.success(`Updated role for ${activeMember.name}`);
    } catch (error) {
      console.error('Change role error:', error);
      const message = error instanceof Error ? error.message : 'Failed to update role';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!activeMember) return;
    if (!token) {
      toast.error('You need to be signed in');
      return;
    }

    const memberToRestore = activeMember;
    setIsSaving(true);
    try {
      const response = await fetch(apiUrl(`/api/team-members/${activeMember.id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to remove member');
      }

      let removedIndex = -1;
      setMembers((prev) => {
        removedIndex = prev.findIndex((member) => member.id === memberToRestore.id);
        return prev.filter((member) => member.id !== memberToRestore.id);
      });
      setRemoveOpen(false);
      toast(`${memberToRestore.name} removed from team`, {
        action: {
          label: 'Undo',
          onClick: () => {
            void (async () => {
              try {
                const restoreResponse = await fetch(apiUrl('/api/team-members'), {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    name: memberToRestore.name,
                    email: memberToRestore.email,
                    role: memberToRestore.role,
                  }),
                });

                if (!restoreResponse.ok) {
                  const restoreError = await restoreResponse.json().catch(() => ({}));
                  throw new Error(restoreError.error || 'Failed to restore member');
                }

                const restored = (await restoreResponse.json()) as TeamMember;
                setMembers((prev) => {
                  if (prev.some((member) => member.id === restored.id)) {
                    return prev;
                  }

                  const next = [...prev];
                  const index = removedIndex < 0 ? 0 : Math.min(removedIndex, next.length);
                  next.splice(index, 0, restored);
                  return next;
                });
                toast.success('Team member restored');
              } catch (error) {
                console.error('Undo remove member error:', error);
                toast.error(error instanceof Error ? error.message : 'Failed to restore member');
              }
            })();
          },
        },
      });
    } catch (error) {
      console.error('Remove member error:', error);
      const message = error instanceof Error ? error.message : 'Failed to remove member';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = (member: TeamMember) => {
    window.location.href = `mailto:${member.email}`;
    toast.success(`Opening mail composer for ${member.name}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Space_Grotesk']">{t('sidebar.team')}</h1>
        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setInviteOpen(true)} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-1" /> Invite Member
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{members.length} members</span>
        <span>•</span>
        <span>{totalProjects} active projects</span>
      </div>

      {isLoading ? (
        <Card className="card-3d border-0">
          <CardContent className="p-6 text-sm text-muted-foreground">Loading team members...</CardContent>
        </Card>
      ) : members.length === 0 ? (
        <Card className="card-3d border-0">
          <CardContent className="p-6 text-sm text-muted-foreground">No team members yet. Use Invite Member to add your first teammate.</CardContent>
        </Card>
      ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => (
          <Card key={m.id} className="card-3d border-0">
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
                    <DropdownMenuItem onClick={() => openRoleDialog(m)}><Shield className="w-4 h-4 mr-2" /> Change Role</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendMessage(m)}><Mail className="w-4 h-4 mr-2" /> Send Message</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => openRemoveDialog(m)}><UserX className="w-4 h-4 mr-2" /> Remove</DropdownMenuItem>
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
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite team member</DialogTitle>
            <DialogDescription>Add a new member to your project team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-name">Full name</Label>
              <Input
                id="invite-name"
                value={inviteForm.name}
                onChange={(event) => setInviteForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteForm.email}
                onChange={(event) => setInviteForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="jane@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteForm.role} onValueChange={(value) => setInviteForm((prev) => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={() => void handleInvite()} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={changeRoleOpen} onOpenChange={setChangeRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              {activeMember ? `Update role for ${activeMember.name}.` : 'Select a new role.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-primary-foreground" onClick={() => void handleChangeRole()} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member</AlertDialogTitle>
            <AlertDialogDescription>
              {activeMember
                ? `${activeMember.name} will be removed from this team.`
                : 'This member will be removed from this team.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={() => void handleRemoveMember()}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Team;
