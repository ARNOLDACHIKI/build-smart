import { Bell, Plus, Search, Film, SlidersHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DemoModeBadge from '@/components/community/DemoModeBadge';

type CommunityLayoutProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenCreatePost: () => void;
  onOpenProfile: () => void;
  onOpenActivity?: () => void;
  onOpenPostSettings?: () => void;
  onOpenReels?: () => void;
  followCount?: number;
  activityCount?: number;
  children: React.ReactNode;
};

const CommunityLayout = ({
  search,
  onSearchChange,
  onOpenCreatePost,
  onOpenProfile,
  onOpenActivity,
  onOpenPostSettings,
  onOpenReels,
  followCount = 0,
  activityCount = 0,
  children,
}: CommunityLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#121420] text-slate-100">
      <DemoModeBadge />
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-[#2A2D3C] bg-[#121420]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-[1280px] items-center gap-3 px-3 sm:px-4">
          <div className="min-w-[120px]">
            <p className="text-base font-bold tracking-wide text-[#BED234]">Community</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Following {followCount}</p>
          </div>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search posts…"
              className="h-9 rounded-full border-[#2A2D3C] bg-[#1A1D2B] pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 transition focus:border-[#3A4156]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenActivity && (
              <button
                type="button"
                onClick={onOpenActivity}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2D3C] bg-[#1A1D2B] transition hover:border-[#BED234]"
                aria-label="Open activity notifications"
              >
                <Bell className="h-4 w-4 text-slate-200" />
                {activityCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-[#BED234] px-1 text-[10px] font-bold text-[#121420]">
                    {activityCount > 9 ? '9+' : activityCount}
                  </span>
                )}
              </button>
            )}
            {onOpenPostSettings && (
              <button
                type="button"
                onClick={onOpenPostSettings}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2D3C] bg-[#1A1D2B] transition hover:border-[#BED234]"
                aria-label="Open post settings"
              >
                <SlidersHorizontal className="h-4 w-4 text-slate-200" />
              </button>
            )}
            {onOpenReels && (
              <Button
                onClick={onOpenReels}
                variant="outline"
                className="h-9 rounded-full border-[#2A2D3C] bg-[#1A1D2B] px-4 text-xs font-bold tracking-wide text-slate-100 transition hover:border-[#BED234] hover:text-[#BED234]"
              >
                <Film className="mr-1.5 h-3.5 w-3.5" />
                Reels
              </Button>
            )}
            <Button
              onClick={onOpenCreatePost}
              className="h-9 rounded-full border-0 bg-[#BED234] px-4 text-xs font-bold tracking-wide text-[#121420] transition hover:brightness-110"
            >
              Create
            </Button>
            <button
              type="button"
              onClick={onOpenProfile}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2D3C] bg-[#1A1D2B] transition hover:border-[#3A4156]"
              aria-label="Open profile"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[#232738] text-[9px] font-semibold text-slate-200">CM</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-3 pb-28 pt-[80px] sm:px-4">{children}</main>

      <Button
        onClick={onOpenCreatePost}
        className="fixed bottom-8 right-6 z-30 h-14 rounded-full border-0 bg-[#BED234] px-6 text-sm font-bold text-[#121420] shadow-[0_16px_32px_rgba(0,0,0,0.4)] transition hover:brightness-110"
        aria-label="Create post"
      >
        <Plus className="mr-2 h-5 w-5" /> Create
      </Button>
    </div>
  );
};

export default CommunityLayout;
