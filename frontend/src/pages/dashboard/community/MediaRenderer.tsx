import { useMemo, useRef, useState } from 'react';
import { Download, FileText, PictureInPicture2, Play, Volume2, VolumeX } from 'lucide-react';
import { assetUrl } from '@/lib/api';
import type { MediaItem } from '@/lib/community';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type MediaRendererProps = {
  media: MediaItem[];
};

const normalizeMediaType = (item: MediaItem): MediaItem['mediaType'] => {
  const lowerName = item.fileName.toLowerCase();

  if (item.mediaType === 'audio' || lowerName.endsWith('.mp3') || lowerName.endsWith('.wav') || lowerName.endsWith('.m4a') || lowerName.endsWith('.ogg')) {
    return 'audio';
  }

  if (item.mediaType === 'document' || lowerName.endsWith('.pdf') || lowerName.endsWith('.doc') || lowerName.endsWith('.docx') || lowerName.endsWith('.ppt') || lowerName.endsWith('.pptx')) {
    return 'document';
  }

  if (item.mediaType === 'video' || lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.mov')) {
    return 'video';
  }

  return 'image';
};

const MediaRenderer = ({ media }: MediaRendererProps) => {
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [videoMutedByKey, setVideoMutedByKey] = useState<Record<string, boolean>>({});
  const [pipEnabledByKey, setPipEnabledByKey] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const imageRefs = useRef<Record<string, HTMLImageElement | null>>({});

  const getImageKey = (item: MediaItem) => `${item.url}-${item.fileName}`;
  const onImageError = (key: string) => {
    setFailedImages((current) => ({ ...current, [key]: true }));
  };

  const isPiPSupported = typeof document !== 'undefined' && Boolean(document.pictureInPictureEnabled);

  const getMediaKey = (item: MediaItem) => `${item.url}-${item.fileName}`;
  const isMuted = (key: string) => (videoMutedByKey[key] ?? true);
  const isPiPEnabled = (key: string) => (pipEnabledByKey[key] ?? false);

  const toggleMute = (key: string) => {
    const nextMuted = !isMuted(key);
    setVideoMutedByKey((current) => ({ ...current, [key]: nextMuted }));

    const video = videoRefs.current[key];
    if (video) {
      video.muted = nextMuted;
    }
  };

  const togglePiPPreference = async (key: string) => {
    const nextEnabled = !isPiPEnabled(key);
    setPipEnabledByKey((current) => ({ ...current, [key]: nextEnabled }));

    if (!nextEnabled && document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
      } catch {
        // Ignore PiP exit failures caused by browser restrictions.
      }
    }
  };

  const togglePictureInPicture = async (key: string) => {
    if (!isPiPSupported || !isPiPEnabled(key)) return;
    const video = videoRefs.current[key];
    if (!video) return;

    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // Ignore PiP entry failures if browser blocks autoplay/user gesture requirements.
    }
  };

  const normalizedMedia = useMemo(
    () => media.map((item) => ({ ...item, mediaType: normalizeMediaType(item) })),
    [media]
  );

  const images = normalizedMedia.filter((item) => item.mediaType === 'image').slice(0, 6);
  const videos = normalizedMedia.filter((item) => item.mediaType === 'video').slice(0, 2);
  const audios = normalizedMedia.filter((item) => item.mediaType === 'audio').slice(0, 2);
  const documents = normalizedMedia.filter((item) => item.mediaType === 'document').slice(0, 2);

  return (
    <div className="space-y-3">
      {videos.map((item) => {
        const src = assetUrl(item.url);
        if (!src) return null;
        const mediaKey = getMediaKey(item);

        return (
          <div
            key={mediaKey}
            className="group relative w-full overflow-hidden rounded-none border-y border-[#2A2D3C] bg-black"
          >
            <div className="aspect-video">
              <video
                ref={(node) => {
                  videoRefs.current[mediaKey] = node;
                }}
                src={src}
                muted={isMuted(mediaKey)}
                autoPlay
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => setActiveMedia(item)}
              className="absolute inset-0 z-10"
              aria-label={`Open ${item.fileName}`}
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" aria-hidden="true" />
            <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleMute(mediaKey);
                }}
                className="inline-flex h-8 items-center gap-1 rounded-full bg-black/65 px-2.5 text-[11px] font-semibold text-white"
                aria-label={isMuted(mediaKey) ? 'Unmute video' : 'Mute video'}
              >
                {isMuted(mediaKey) ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                {isMuted(mediaKey) ? 'Muted' : 'Audio on'}
              </button>

              {isPiPSupported && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void togglePiPPreference(mediaKey);
                  }}
                  className="inline-flex h-8 items-center gap-1 rounded-full bg-black/65 px-2.5 text-[11px] font-semibold text-white"
                  aria-label={isPiPEnabled(mediaKey) ? 'Disable picture in picture' : 'Enable picture in picture'}
                >
                  <PictureInPicture2 className="h-3.5 w-3.5" />
                  {isPiPEnabled(mediaKey) ? 'PiP enabled' : 'PiP off'}
                </button>
              )}
            </div>
            <span className="pointer-events-none absolute bottom-3 right-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#BED234] text-[#121420] shadow-lg">
              <Play className="h-4 w-4" />
            </span>
            {isPiPSupported && isPiPEnabled(mediaKey) && (
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  void togglePictureInPicture(mediaKey);
                }}
                className="absolute bottom-3 left-3 z-20 inline-flex h-8 items-center gap-1 rounded-full bg-black/65 px-2.5 text-[11px] font-semibold text-white"
                aria-label="Toggle picture in picture"
              >
                <PictureInPicture2 className="h-3.5 w-3.5" /> Open PiP
              </button>
            )}
          </div>
        );
      })}

      {images.length > 0 && (
        images.length === 1 ? (
          (() => {
            const imgKey = getImageKey(images[0]);
            const hasFailed = failedImages[imgKey];
            const src = assetUrl(images[0].url);

            return (
              <button
                type="button"
                onClick={() => setActiveMedia(images[0])}
                className="relative w-full overflow-hidden rounded-none border-y border-[#2A2D3C] bg-gradient-to-br from-slate-700 to-slate-900"
              >
                {!hasFailed && (
                  <img
                    src={src}
                    alt={images[0].fileName}
                    loading="lazy"
                    onError={() => onImageError(imgKey)}
                    className="h-auto w-full object-cover"
                  />
                )}
                {hasFailed && (
                  <div className="relative h-64 w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs font-medium text-slate-400 line-clamp-2 px-2">{images[0].fileName}</p>
                    </div>
                  </div>
                )}
              </button>
            );
          })()
        ) : (
          <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
            {images.map((item) => {
              const src = assetUrl(item.url);
              if (!src) return null;
              const imgKey = getImageKey(item);
              const hasFailed = failedImages[imgKey];

              return (
                <button
                  key={imgKey}
                  type="button"
                  onClick={() => setActiveMedia(item)}
                  className="relative min-w-[85%] snap-center overflow-hidden rounded-xl border border-[#2A2D3C] bg-gradient-to-br from-slate-700 to-slate-900"
                >
                  {!hasFailed && (
                    <img
                      ref={(node) => {
                        imageRefs.current[imgKey] = node;
                      }}
                      src={src}
                      alt={item.fileName}
                      loading="lazy"
                      onError={() => onImageError(imgKey)}
                      className="h-64 w-full object-cover"
                    />
                  )}
                  {hasFailed && (
                    <div className="relative h-64 w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs font-medium text-slate-400 line-clamp-2 px-2">{item.fileName}</p>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )
      )}

      {audios.map((item) => {
        const src = assetUrl(item.url);
        if (!src) return null;

        return (
          <div key={`${item.url}-${item.fileName}`} className="rounded-xl border border-[#2A2D3C] bg-[#121420] p-3">
            <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-300">
              <Volume2 className="h-3.5 w-3.5 text-[#BED234]" /> Audio
            </p>
            <audio controls preload="none" className="w-full">
              <source src={src} />
            </audio>
          </div>
        );
      })}

      {documents.map((item) => {
        const src = assetUrl(item.url);
        if (!src) return null;

        return (
          <div key={`${item.url}-${item.fileName}`} className="rounded-xl border border-[#2A2D3C] bg-[#121420] p-3">
            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 text-[#BED234]" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm text-slate-100">{item.fileName}</p>
                <p className="text-xs text-slate-400">Document preview</p>
              </div>
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full border border-[#2A2D3C] px-2 py-1 text-xs text-slate-300 hover:bg-[#1A1D2B]"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
            </div>
          </div>
        );
      })}

      <Dialog open={Boolean(activeMedia)} onOpenChange={(open) => !open && setActiveMedia(null)}>
        <DialogContent className="h-screen w-screen max-w-none border-0 bg-black/95 p-2 text-slate-100">
          {activeMedia && (() => {
            const src = assetUrl(activeMedia.url);
            if (!src) return null;

            if (activeMedia.mediaType === 'video') {
              const mediaKey = getMediaKey(activeMedia);
              return (
                <video
                  controls
                  autoPlay
                  muted={isMuted(mediaKey)}
                  disablePictureInPicture={!isPiPEnabled(mediaKey)}
                  className="h-full w-full rounded-md object-contain"
                >
                  <source src={src} />
                </video>
              );
            }

            if (activeMedia.mediaType === 'image') {
              return <img src={src} alt={activeMedia.fileName} className="h-full w-full rounded-md object-contain" />;
            }

            return (
              <div className="flex h-full items-center justify-center">
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#BED234] px-4 py-2 text-sm font-medium text-[#121420]"
                >
                  <Download className="h-4 w-4" /> Download file
                </a>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaRenderer;
