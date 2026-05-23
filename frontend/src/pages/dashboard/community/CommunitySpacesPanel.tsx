import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Globe, Link2, Plus, ShieldAlert, Sparkles, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { InviteTokenModal } from './InviteTokenModal';
import {
  createCommunitySpace,
  createCommunitySpaceInvite,
  getCommunitySpaces,
  joinCommunitySpace,
  leaveCommunitySpace,
  respondToCommunitySpaceRequest,
  updateCommunitySpace,
  type CommunitySpaceJoinPolicy,
  type CommunitySpaceSummary,
} from '@/lib/community';

type CommunitySpacesPanelProps = {
  selectedSpaceId: string | null;
  onSelectSpace: (spaceId: string | null, spaceName?: string | null) => void;
};

const joinPolicyLabel: Record<CommunitySpaceJoinPolicy, string> = {
  OPEN: 'Allow all',
  APPROVAL: 'Selective approval',
  INVITE_ONLY: 'Invite only',
};

const joinPolicyDescription: Record<CommunitySpaceJoinPolicy, string> = {
  OPEN: 'Anyone can join instantly.',
  APPROVAL: 'Users request access and you approve them.',
  INVITE_ONLY: 'Only users with an invite can join.',
};

const joinPolicyTone: Record<CommunitySpaceJoinPolicy, string> = {
  OPEN: 'border-[#2D5A2F] bg-[#102216] text-[#B8F7C2]',
  APPROVAL: 'border-[#5D4E1F] bg-[#221D10] text-[#FFE39D]',
  INVITE_ONLY: 'border-[#4A2D5A] bg-[#201027] text-[#E8B8FF]',
};

const emptyCreateForm = {
  name: '',
  description: '',
  joinPolicy: 'OPEN' as CommunitySpaceJoinPolicy,
};

const CommunitySpacesPanel = ({ selectedSpaceId, onSelectSpace }: CommunitySpacesPanelProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState<CommunitySpaceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [inviteTokenModalOpen, setInviteTokenModalOpen] = useState(false);
  const [pendingJoinSpace, setPendingJoinSpace] = useState<CommunitySpaceSummary | null>(null);

  const selectedSpace = useMemo(() => spaces.find((space) => space.id === selectedSpaceId) || null, [spaces, selectedSpaceId]);

  const loadSpaces = async () => {
    setIsLoading(true);
    try {
      const response = await getCommunitySpaces();
      setSpaces(response.spaces);
    } catch (error) {
      toast({
        title: 'Unable to load communities',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSpaces();
  }, []);

  const refreshAfterMutation = async (nextSelectedSpaceId?: string | null, nextSelectedSpaceName?: string | null) => {
    await loadSpaces();
    if (typeof nextSelectedSpaceId !== 'undefined') {
      onSelectSpace(nextSelectedSpaceId, nextSelectedSpaceName);
    }
  };

  const handleCreateSpace = async () => {
    if (!createForm.name.trim()) {
      toast({ title: 'Community name is required', variant: 'destructive' });
      return;
    }

    setIsMutating(true);
    try {
      const response = await createCommunitySpace({
        name: createForm.name.trim(),
        description: createForm.description.trim() || `${createForm.name.trim()} community`,
        joinPolicy: createForm.joinPolicy,
      });

      setCreateForm(emptyCreateForm);
      setIsCreating(false);
      toast({ title: 'Community created', description: `${response.space.name} is ready.` });
      await refreshAfterMutation(response.space.id, response.space.name);
    } catch (error) {
      toast({
        title: 'Unable to create community',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleJoinSpace = async (space: CommunitySpaceSummary) => {
    if (space.viewerMembership?.status === 'ACTIVE') {
      navigate(`/community/space/${space.id}/feed`);
      return;
    }

    if (space.joinPolicy === 'INVITE_ONLY') {
      setPendingJoinSpace(space);
      setInviteTokenModalOpen(true);
      return;
    }

    setIsMutating(true);
    try {
      const response = await joinCommunitySpace(space.id);
      toast({
        title: response.membership?.status === 'PENDING' ? 'Request sent' : 'Joined community',
        description:
          response.membership?.status === 'PENDING'
            ? 'The owner will review your request.'
            : `You joined ${space.name}.`,
      });
      await refreshAfterMutation(response.space.id, response.space.name);
    } catch (error) {
      toast({
        title: 'Unable to join community',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleLeaveSpace = async (space: CommunitySpaceSummary) => {
    setIsMutating(true);
    try {
      await leaveCommunitySpace(space.id);
      toast({ title: 'Left community', description: `${space.name} has been removed from your spaces.` });
      const nextSelectedId = selectedSpaceId === space.id ? null : selectedSpaceId;
      await refreshAfterMutation(nextSelectedId, nextSelectedId ? undefined : null);
    } catch (error) {
      toast({
        title: 'Unable to leave community',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleInviteSpace = async (space: CommunitySpaceSummary) => {
    const email = window.prompt(`Invite someone to ${space.name} (optional email). Leave blank to just generate a link.`)?.trim() || undefined;

    setIsMutating(true);
    try {
      const response = await createCommunitySpaceInvite(space.id, email);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(response.invite.inviteUrl);
      }
      toast({
        title: 'Invite ready',
        description: email
          ? `Invitation sent to ${email || 'the selected email'}.`
          : 'Invite link copied to clipboard.',
      });
      await refreshAfterMutation(selectedSpaceId);
    } catch (error) {
      toast({
        title: 'Unable to create invite',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleConfirmInviteToken = async (inviteToken: string) => {
    if (!pendingJoinSpace) return;

    setInviteTokenModalOpen(false);
    setIsMutating(true);
    try {
      const response = await joinCommunitySpace(pendingJoinSpace.id, inviteToken);
      toast({
        title: 'Joined community',
        description: `You joined ${pendingJoinSpace.name}.`,
      });
      setPendingJoinSpace(null);
      await refreshAfterMutation(response.space.id, response.space.name);
    } catch (error) {
      toast({
        title: 'Unable to join community',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handlePolicyChange = async (space: CommunitySpaceSummary, joinPolicy: CommunitySpaceJoinPolicy) => {
    setIsMutating(true);
    try {
      const response = await updateCommunitySpace(space.id, { joinPolicy });
      toast({ title: 'Community updated', description: `${response.space.name} now uses ${joinPolicyLabel[joinPolicy].toLowerCase()}.` });
      await refreshAfterMutation(selectedSpaceId);
    } catch (error) {
      toast({
        title: 'Unable to update community',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleReview = async (space: CommunitySpaceSummary, membershipId: string, action: 'approve' | 'reject') => {
    setIsMutating(true);
    try {
      const response = await respondToCommunitySpaceRequest(space.id, membershipId, action);
      toast({
        title: action === 'approve' ? 'Request approved' : 'Request rejected',
        description: `${space.name} membership was updated.`,
      });
      await refreshAfterMutation(response.space.id, response.space.name);
    } catch (error) {
      toast({
        title: 'Unable to review request',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#2A2D3C] bg-[#1A1D2B] p-4 shadow-[0_12px_28px_-24px_rgba(0,0,0,0.85)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#BED234]">Sub communities</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-100">Create, join, and moderate focused groups</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Open communities are instant. Approval communities queue requests. Invite-only communities require a link or a direct invitation from the owner.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-[#2A2D3C] bg-[#121420] text-slate-200 hover:border-[#BED234] hover:text-[#BED234]"
            onClick={() => onSelectSpace(null)}
          >
            <Globe className="mr-2 h-4 w-4" /> All communities
          </Button>
          <Button
            type="button"
            className="border-0 bg-[#BED234] text-[#121420] hover:brightness-110"
            onClick={() => setIsCreating((current) => !current)}
          >
            <Plus className="mr-2 h-4 w-4" /> Create community
          </Button>
        </div>
      </div>

      {isCreating && (
        <div className="mt-4 rounded-2xl border border-[#2A2D3C] bg-[#121420] p-4">
          <div className="grid gap-3 md:grid-cols-[1.2fr_1.8fr_auto]">
            <Input
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Community name"
              className="border-[#2A2D3C] bg-[#1A1D2B] text-slate-100 placeholder:text-slate-500"
            />
            <Textarea
              value={createForm.description}
              onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="What should this community help people discuss?"
              rows={2}
              className="border-[#2A2D3C] bg-[#1A1D2B] text-slate-100 placeholder:text-slate-500"
            />
            <div className="flex flex-col gap-2">
              <select
                value={createForm.joinPolicy}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, joinPolicy: event.target.value as CommunitySpaceJoinPolicy }))
                }
                className="h-10 rounded-md border border-[#2A2D3C] bg-[#1A1D2B] px-3 text-sm text-slate-100"
              >
                <option value="OPEN">Allow all</option>
                <option value="APPROVAL">Selective approval</option>
                <option value="INVITE_ONLY">Invite only</option>
              </select>
              <Button
                type="button"
                disabled={isMutating}
                className="bg-[#BED234] text-[#121420] hover:brightness-110"
                onClick={() => void handleCreateSpace()}
              >
                Create
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className={`rounded-full border px-3 py-1 ${joinPolicyTone[createForm.joinPolicy]}`}>
              {joinPolicyLabel[createForm.joinPolicy]}
            </span>
            <span>{joinPolicyDescription[createForm.joinPolicy]}</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {isLoading ? (
          <span className="text-sm text-slate-400">Loading communities...</span>
        ) : (
          spaces.map((space) => {
            const isSelected = selectedSpaceId === space.id;
            const viewerStatus = space.viewerMembership?.status || null;
            const isJoined = viewerStatus === 'ACTIVE';
            const isPending = viewerStatus === 'PENDING';
            const canManage = space.isOwner;

            return (
              <article
                key={space.id}
                className={`min-w-[320px] max-w-[420px] flex-1 rounded-2xl border p-4 transition ${
                  isSelected ? 'border-[#BED234] bg-[#141823]' : 'border-[#2A2D3C] bg-[#121420] hover:border-[#3A4156]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-100">{space.name}</h3>
                      {space.isFeatured && <Badge className="border-0 bg-[#BED234] text-[10px] text-[#121420]">Featured</Badge>}
                      {isSelected && <Badge variant="outline" className="border-[#BED234] text-[#BED234]">Selected</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Owned by {space.owner.name}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div className="flex items-center gap-1 justify-end"><Users className="h-3.5 w-3.5" />{space.memberCount}</div>
                    <div className="mt-1 flex items-center gap-1 justify-end"><ShieldAlert className="h-3.5 w-3.5" />{joinPolicyLabel[space.joinPolicy]}</div>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-300">{space.description}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] ${joinPolicyTone[space.joinPolicy]}`}>
                    {joinPolicyLabel[space.joinPolicy]}
                  </span>
                  <span className="rounded-full border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {space.memberCount} members
                  </span>
                </div>

                {canManage && (
                  <div className="mt-4 rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#BED234]">Owner controls</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-[#2A2D3C] bg-[#121420] text-slate-300 hover:border-[#BED234] hover:text-[#BED234]"
                        onClick={() => void handleInviteSpace(space)}
                        disabled={isMutating}
                      >
                        <Link2 className="mr-2 h-3.5 w-3.5" /> Invite
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                      <select
                        value={space.joinPolicy}
                        onChange={(event) => void handlePolicyChange(space, event.target.value as CommunitySpaceJoinPolicy)}
                        className="h-10 rounded-md border border-[#2A2D3C] bg-[#121420] px-3 text-sm text-slate-100"
                        disabled={isMutating}
                      >
                        <option value="OPEN">Allow all</option>
                        <option value="APPROVAL">Selective approval</option>
                        <option value="INVITE_ONLY">Invite only</option>
                      </select>
                      <Button
                        type="button"
                        variant="secondary"
                        className="border-[#2A2D3C] bg-[#121420] text-slate-200 hover:bg-[#1F2433]"
                        onClick={() => onSelectSpace(space.id, space.name)}
                      >
                        Open feed
                      </Button>
                    </div>
                    {space.pendingRequests.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-slate-400">Pending requests</p>
                        {space.pendingRequests.map((request) => (
                          <div key={request.id} className="rounded-lg border border-[#2A2D3C] bg-[#121420] px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium text-slate-100">{request.userName}</p>
                                <p className="text-xs text-slate-500">{request.userEmail}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="bg-[#BED234] text-[#121420] hover:brightness-110"
                                  onClick={() => void handleReview(space, request.id, 'approve')}
                                  disabled={isMutating}
                                >
                                  <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-[#2A2D3C] bg-transparent text-slate-300 hover:border-[#BED234] hover:text-[#BED234]"
                                  onClick={() => void handleReview(space, request.id, 'reject')}
                                  disabled={isMutating}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    className="bg-[#BED234] text-[#121420] hover:brightness-110"
                    onClick={() => void handleJoinSpace(space)}
                    disabled={isMutating || isPending}
                  >
                    {isJoined ? 'Open feed' : isPending ? 'Request pending' : space.joinPolicy === 'INVITE_ONLY' ? 'Join with invite' : space.joinPolicy === 'APPROVAL' ? 'Request to join' : 'Join community'}
                  </Button>
                  {isJoined && !canManage && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#2A2D3C] bg-transparent text-slate-300 hover:border-[#BED234] hover:text-[#BED234]"
                      onClick={() => void handleLeaveSpace(space)}
                      disabled={isMutating}
                    >
                      Leave
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-slate-400 hover:bg-[#1F2433] hover:text-slate-100"
                    onClick={() => navigate(`/community/space/${space.id}/feed`)}
                  >
                    {isSelected ? 'Selected' : 'View feed'}
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Owner: {space.owner.name}</span>
                  <span>{space.pendingRequests.length} pending requests</span>
                </div>
              </article>
            );
          })
        )}
      </div>

      {!isLoading && spaces.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-[#2A2D3C] bg-[#121420] px-4 py-10 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-[#BED234]" />
          <p className="mt-3 text-sm font-medium text-slate-100">No sub-communities yet</p>
          <p className="mt-1 text-sm text-slate-400">Create the first community to start organizing conversations.</p>
        </div>
      )}

      {selectedSpace && (
        <div className="mt-4 rounded-2xl border border-[#2A2D3C] bg-[#121420] px-4 py-3 text-sm text-slate-300">
          Viewing <span className="font-semibold text-slate-100">{selectedSpace.name}</span>. Posts created now will go into this community.
        </div>
      )}

      <InviteTokenModal
        open={inviteTokenModalOpen}
        onOpenChange={setInviteTokenModalOpen}
        spaceName={pendingJoinSpace?.name || ''}
        onConfirm={handleConfirmInviteToken}
      />
    </section>
  );
};

export default CommunitySpacesPanel;
