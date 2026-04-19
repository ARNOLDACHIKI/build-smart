import { useState } from 'react';
import { ChevronDown, ExternalLink, Megaphone, Sparkles, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { CommunityAd, CommunityRecommendation } from '@/lib/community';

type ExploreDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: string[];
  recommendations: CommunityRecommendation[];
  ads: CommunityAd[];
};

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B]">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between px-3 py-3 text-left transition hover:bg-[#202436]"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
          {icon}
          {title}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          {expanded ? 'Collapse' : 'Expand'}
          <ChevronDown className={`h-3.5 w-3.5 transition ${expanded ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {expanded && <div className="space-y-2 border-t border-[#2A2D3C] px-3 py-3">{children}</div>}
    </section>
  );
};

const ExploreDrawer = ({ open, onOpenChange, topics, recommendations, ads }: ExploreDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-[#2A2D3C] bg-[#121420] text-slate-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[320px] sm:max-w-[320px]">
        <SheetHeader>
          <SheetTitle className="text-slate-100">Explore</SheetTitle>
          <SheetDescription className="text-slate-400">Advanced discovery tools and monetized content.</SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4">
          <Section title="Trending topics" icon={<TrendingUp className="h-4 w-4 text-primary" />}>
            <div className="flex flex-wrap gap-1.5">
              {topics.map((topic) => (
                <Badge key={topic} variant="secondary" className="rounded-md border border-[#2A2D3C] bg-[#121420] text-slate-300">
                  {topic}
                </Badge>
              ))}
            </div>
          </Section>

          <Section title="AI recommendations" icon={<Sparkles className="h-4 w-4 text-primary" />}>
            {recommendations.length === 0 ? (
              <p className="text-sm text-slate-400">No recommendations available.</p>
            ) : (
              recommendations.map((item) => (
                <div key={item.id} className="rounded-md border border-[#2A2D3C] bg-[#121420] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <Badge variant="outline" className="border-[#2A2D3C] text-slate-300">{item.format}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.field}</p>
                </div>
              ))
            )}
          </Section>

          <Section title="Sponsored posts" icon={<Megaphone className="h-4 w-4 text-primary" />}>
            {ads.length === 0 ? (
              <p className="text-sm text-slate-400">No sponsored posts right now.</p>
            ) : (
              ads.map((item) => (
                <div key={item.id} className="rounded-md border border-[#2A2D3C] bg-[#121420] px-3 py-2">
                  <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.copy}</p>
                  <a
                    href={item.ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#BED234]"
                  >
                    View offer
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))
            )}
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExploreDrawer;
