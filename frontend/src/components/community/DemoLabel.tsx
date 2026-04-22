import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type DemoLabelProps = {
  variant?: 'badge' | 'banner' | 'inline';
  demoLabel?: string;
};

const DemoLabel = ({ variant = 'badge', demoLabel }: DemoLabelProps) => {
  if (!demoLabel) return null;

  if (variant === 'badge') {
    return (
      <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30">
        <AlertCircle className="h-3 w-3 mr-1" />
        {demoLabel}
      </Badge>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-amber-500/10 border-l-4 border-amber-500 px-3 py-2 rounded-r">
        <p className="text-xs font-semibold text-amber-300 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5" />
          {demoLabel}
        </p>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
      <AlertCircle className="h-3 w-3" />
      {demoLabel}
    </span>
  );
};

export default DemoLabel;
