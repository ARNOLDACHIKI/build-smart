import { AudioLines, CalendarClock, FileText, Image, Send, UploadCloud, Video } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type CreatePostModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    title: string;
    content: string;
    contentTypes: string[];
    scheduledAt: string;
    mediaFiles: File[];
    isLiveSession: boolean;
    liveTitle: string;
    liveStartsAt: string;
    liveRoomUrl: string;
    liveDescription: string;
  }) => Promise<void>;
};

const contentChoices = [
  { id: 'text', label: 'Text', icon: FileText },
  { id: 'image', label: 'Image', icon: Image },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'audio', label: 'Audio', icon: AudioLines },
  { id: 'document', label: 'Document', icon: FileText },
];

const CreatePostModal = ({ open, onOpenChange, onSubmit }: CreatePostModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['text']);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [liveTitle, setLiveTitle] = useState('');
  const [liveStartsAt, setLiveStartsAt] = useState('');
  const [liveRoomUrl, setLiveRoomUrl] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTypeTab, setActiveTypeTab] = useState('text');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  const resolveAcceptForTab = (tab: string) => {
    if (tab === 'image') return 'image/*';
    if (tab === 'video') return 'video/*';
    if (tab === 'audio') return 'audio/*';
    if (tab === 'document') return '.pdf,.doc,.docx,.ppt,.pptx,.txt';
    return 'image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.txt';
  };

  const mergeFiles = (incoming: FileList | File[]) => {
    const next = Array.from(incoming);
    setMediaFiles((current) => {
      const map = new Map<string, File>();
      [...current, ...next].forEach((file) => {
        map.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      });
      return Array.from(map.values()).slice(0, 6);
    });
  };

  const handleTypeTabChange = (value: string) => {
    setActiveTypeTab(value);
    setSelectedTypes((current) => {
      const typeIds = contentChoices.map((choice) => choice.id);
      const rest = current.filter((type) => !typeIds.includes(type));
      return [value, ...rest];
    });
  };

  const submit = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        contentTypes: selectedTypes,
        scheduledAt,
        mediaFiles,
        isLiveSession,
        liveTitle: liveTitle.trim(),
        liveStartsAt,
        liveRoomUrl: liveRoomUrl.trim(),
        liveDescription: liveDescription.trim(),
      });

      setTitle('');
      setContent('');
      setScheduledAt('');
      setSelectedTypes(['text']);
      setMediaFiles([]);
      setIsLiveSession(false);
      setLiveTitle('');
      setLiveStartsAt('');
      setLiveRoomUrl('');
      setLiveDescription('');
      setActiveTypeTab('text');
      setShowAdvanced(false);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-screen w-screen max-w-none flex-col overflow-hidden rounded-none border-0 bg-[#121420] p-0 text-slate-100 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
        <DialogHeader className="border-b border-[#2A2D3C] px-6 py-4">
          <DialogTitle className="text-xl text-slate-100">Create Post</DialogTitle>
          <DialogDescription className="text-slate-400">Draft rich content and optionally schedule publishing.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 pb-8">
          <div className="mx-auto w-full max-w-4xl space-y-6">
            <Tabs value={activeTypeTab} onValueChange={handleTypeTabChange}>
              <TabsList className="h-10 w-full justify-start gap-2 overflow-x-auto rounded-md border border-[#2A2D3C] bg-[#1A1D2B] p-1">
                {contentChoices.map((choice) => {
                  const Icon = choice.icon;
                  return (
                    <TabsTrigger
                      key={choice.id}
                      value={choice.id}
                      className="h-8 rounded-md border border-transparent px-3 text-xs data-[state=active]:border-[#BED234] data-[state=active]:bg-[#BED234] data-[state=active]:text-[#121420]"
                    >
                      <Icon className="mr-1.5 h-3.5 w-3.5" /> {choice.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="post-title" className="text-sm text-slate-300">Title</Label>
              <Input
                id="post-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Post title"
                className="border-[#2A2D3C] bg-[#1A1D2B] text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-content" className="text-sm text-slate-300">Content</Label>
              <Textarea
                id="post-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your post"
                rows={10}
                className="border-[#2A2D3C] bg-[#1A1D2B] text-slate-100 placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-media" className="text-sm text-slate-300">Media and files</Label>
              <label
                htmlFor="post-media"
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-5 text-center transition ${
                  isDraggingFiles ? 'border-[#BED234] bg-[#BED234]/10' : 'border-[#2A2D3C] bg-[#1A1D2B] hover:border-[#3B4058]'
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingFiles(true);
                }}
                onDragLeave={() => setIsDraggingFiles(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDraggingFiles(false);
                  mergeFiles(event.dataTransfer.files);
                }}
              >
                <UploadCloud className="h-6 w-6 text-[#BED234]" />
                <p className="text-sm text-slate-200">Drag and drop files here or click to upload</p>
                <p className="text-xs text-slate-500">Images, videos, audio, reports and docs (max 6)</p>
              </label>
              <Input
                id="post-media"
                type="file"
                multiple
                accept={resolveAcceptForTab(activeTypeTab)}
                onChange={(event) => mergeFiles(event.target.files || [])}
                className="hidden"
              />

              {mediaFiles.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2">
                  {mediaFiles.map((file) => (
                    <div key={`${file.name}-${file.size}`} className="rounded-md border border-[#2A2D3C] bg-[#121420] px-3 py-2">
                      <p className="line-clamp-1 text-sm text-slate-200">{file.name}</p>
                      <p className="text-xs text-slate-500">{Math.max(1, Math.round(file.size / 1024))} KB</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] p-4">
              <p className="text-sm font-medium text-slate-100">Preview</p>
              <p className="mt-1 text-xs text-slate-500">This is how your draft appears in the feed.</p>
              <div className="mt-3 rounded-md border border-[#2A2D3C] bg-[#121420] p-3">
                <p className="text-[18px] font-bold text-slate-100">{title.trim() || 'Untitled post'}</p>
                <p className="mt-2 line-clamp-3 text-sm text-slate-300">{content.trim() || 'Post preview will appear here once you add content.'}</p>
                {mediaFiles.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {mediaFiles.slice(0, 3).map((file) => (
                      <Badge key={`${file.name}-${file.size}-preview`} variant="outline" className="border-[#2A2D3C] text-slate-300">
                        {file.type.split('/')[0] || 'file'}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-100">Live room or session</p>
                  <p className="text-xs text-slate-500">Enable this to turn the post into a live session invite.</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={isLiveSession ? 'default' : 'outline'}
                  onClick={() => setIsLiveSession((current) => !current)}
                  className={isLiveSession ? 'border-0 bg-[#BED234] text-[#121420]' : 'border-[#2A2D3C] bg-transparent text-slate-300'}
                >
                  {isLiveSession ? 'Enabled' : 'Enable'}
                </Button>
              </div>

              {isLiveSession && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="live-title" className="text-sm text-slate-300">Session title</Label>
                    <Input
                      id="live-title"
                      value={liveTitle}
                      onChange={(event) => setLiveTitle(event.target.value)}
                      placeholder="Weekly contractor Q&A"
                      className="border-[#2A2D3C] bg-[#121420] text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="live-start" className="text-sm text-slate-300">Starts at</Label>
                    <Input
                      id="live-start"
                      type="datetime-local"
                      value={liveStartsAt}
                      onChange={(event) => setLiveStartsAt(event.target.value)}
                      className="border-[#2A2D3C] bg-[#121420] text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="live-url" className="text-sm text-slate-300">Room URL (optional)</Label>
                    <Input
                      id="live-url"
                      value={liveRoomUrl}
                      onChange={(event) => setLiveRoomUrl(event.target.value)}
                      placeholder="https://meet.example.com/room/site-updates"
                      className="border-[#2A2D3C] bg-[#121420] text-slate-100"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="live-desc" className="text-sm text-slate-300">Session agenda (optional)</Label>
                    <Textarea
                      id="live-desc"
                      value={liveDescription}
                      onChange={(event) => setLiveDescription(event.target.value)}
                      placeholder="Topics, goals, and expected outcomes"
                      rows={3}
                      className="border-[#2A2D3C] bg-[#121420] text-slate-100"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#2A2D3C] bg-[#1A1D2B] p-4">
              <button
                type="button"
                onClick={() => setShowAdvanced((current) => !current)}
                className="flex w-full items-center justify-between text-left"
                aria-expanded={showAdvanced}
              >
                <span className="text-sm font-medium text-slate-100">Advanced</span>
                <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                  <Switch checked={showAdvanced} onCheckedChange={setShowAdvanced} />
                  {showAdvanced ? 'Hide' : 'Show'}
                </div>
              </button>

              {showAdvanced && (
                <div className="mt-4 rounded-md border border-[#2A2D3C] bg-[#121420] p-3">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
                    <CalendarClock className="h-4 w-4 text-[#BED234]" /> Scheduling options
                  </div>
                  <Input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    className="border-[#2A2D3C] bg-[#1A1D2B] text-slate-100"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Leave empty to publish immediately, or schedule as part of campaign planning.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {selectedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="border border-[#2A2D3C] bg-[#1A1D2B] text-slate-300">
                  {type}
                </Badge>
              ))}
              {isLiveSession && <Badge variant="secondary" className="border border-[#2A2D3C] bg-[#1A1D2B] text-slate-300">live-session</Badge>}
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-20 bg-transparent px-6 pb-4 pt-3">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-end gap-3 rounded-2xl border border-[#BED234]/35 bg-[#0f1320]/95 px-4 py-3 shadow-[0_18px_44px_rgba(0,0,0,0.45),0_0_0_1px_rgba(190,210,52,0.12)] backdrop-blur-xl">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="h-11 min-w-32 border-[#2A2D3C] bg-transparent px-5 text-slate-200 hover:bg-[#1A1D2B]">
              Cancel
            </Button>
            <Button
              onClick={() => void submit()}
              disabled={
                isSubmitting ||
                !title.trim() ||
                !content.trim() ||
                (isLiveSession && (!liveTitle.trim() || !liveStartsAt))
              }
              className="h-11 min-w-40 border-0 bg-[#BED234] px-6 font-semibold text-[#121420] ring-1 ring-[#D7EA65]/65 shadow-[0_12px_30px_rgba(190,210,52,0.38)] hover:brightness-105"
            >
              <Send className="mr-2 h-4 w-4" /> Publish
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
