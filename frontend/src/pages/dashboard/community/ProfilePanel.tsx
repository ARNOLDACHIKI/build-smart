import { Award, BarChart3, Lock, Medal, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type ProfilePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorAnalytics: Array<{ label: string; value: string }>;
  followCount: number;
};

const ProfilePanel = ({ open, onOpenChange, creatorAnalytics, followCount }: ProfilePanelProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-[#2A2D3C] bg-[#121420] text-slate-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[360px] sm:max-w-[360px]">
        <SheetHeader>
          <SheetTitle className="text-slate-100">Profile and Creator</SheetTitle>
          <SheetDescription className="text-slate-400">Analytics, reputation, badges, and privacy controls.</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-5">
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <BarChart3 className="h-4 w-4 text-primary" /> Creator analytics
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {creatorAnalytics.map((item) => (
                <div key={item.label} className="rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] px-2 py-3 text-center">
                  <p className="text-base font-bold text-slate-100">{item.value}</p>
                  <p className="text-[11px] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Award className="h-4 w-4 text-primary" /> Reputation points
            </h3>
            <div className="rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Points</span>
                <Badge variant="outline" className="border-[#2A2D3C] text-slate-200">1,280</Badge>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-400">Follows</span>
                <span className="inline-flex items-center gap-1 text-sm text-slate-200">
                  <Users className="h-3.5 w-3.5" /> {followCount}
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Medal className="h-4 w-4 text-primary" /> Badges
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="border border-[#2A2D3C] bg-[#1A1D2B] text-slate-300">Top Contributor</Badge>
              <Badge variant="secondary" className="border border-[#2A2D3C] bg-[#1A1D2B] text-slate-300">Verified Profile</Badge>
              <Badge variant="secondary" className="border border-[#2A2D3C] bg-[#1A1D2B] text-slate-300">Community Mentor</Badge>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Lock className="h-4 w-4 text-primary" /> Privacy controls
            </h3>
            <div className="rounded-xl border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3 text-sm text-slate-400">
              Public profile, private contacts, and approval-based follows are enabled.
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfilePanel;
