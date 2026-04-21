import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type PostSettingsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    showLikes: boolean;
    showComments: boolean;
    showFollows: boolean;
  };
  onChange: (patch: Partial<{ showLikes: boolean; showComments: boolean; showFollows: boolean }>) => void;
};

const PostSettingsDrawer = ({ open, onOpenChange, settings, onChange }: PostSettingsDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-l border-[#2A2D3C] bg-[#121420] text-slate-100 sm:max-w-[360px]">
        <SheetHeader>
          <SheetTitle className="text-slate-100">Post settings</SheetTitle>
          <SheetDescription className="text-slate-400">
            These are your default visibility settings for new posts. Existing posts can still be changed from each post menu.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3">
            <Label className="text-sm text-slate-200">Show likes count by default</Label>
            <Switch checked={settings.showLikes} onCheckedChange={(checked) => onChange({ showLikes: checked })} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3">
            <Label className="text-sm text-slate-200">Show comments count by default</Label>
            <Switch checked={settings.showComments} onCheckedChange={(checked) => onChange({ showComments: checked })} />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] px-3 py-3">
            <Label className="text-sm text-slate-200">Show followers count by default</Label>
            <Switch checked={settings.showFollows} onCheckedChange={(checked) => onChange({ showFollows: checked })} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PostSettingsDrawer;
