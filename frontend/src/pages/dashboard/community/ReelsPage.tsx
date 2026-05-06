import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, Play, Volume2, VolumeX, Share2, MessageCircle, Heart, PictureInPicture2, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommunityPost, MediaItem } from '@/lib/community';
import { assetUrl } from '@/lib/api';
import { expandedMockPosts } from './expandedMockPosts';
import mockCommunityData from './mockCommunityData';

interface ReelPost {
  post: CommunityPost;
  isPlaying: boolean;
  isMuted: boolean;
  pipEnabled: boolean;
}

const hasVideoMedia = (post: CommunityPost) =>
  (post.media ?? []).some((item) => item.mediaType === 'video' || item.fileName.toLowerCase().endsWith('.mp4') || item.fileName.toLowerCase().endsWith('.webm') || item.fileName.toLowerCase().endsWith('.mov'));

const normalizeToVideoFirst = (post: CommunityPost): CommunityPost => {
  const media = post.media ?? [];
  const videoIndex = media.findIndex(
    (item) => item.mediaType === 'video' || item.fileName.toLowerCase().endsWith('.mp4') || item.fileName.toLowerCase().endsWith('.webm') || item.fileName.toLowerCase().endsWith('.mov')
  );

  if (videoIndex <= 0) return post;

  const reorderedMedia = [media[videoIndex], ...media.slice(0, videoIndex), ...media.slice(videoIndex + 1)];
  return { ...post, media: reorderedMedia };
};

const createReels = (posts: CommunityPost[]): ReelPost[] =>
  posts.map((post, index) => ({
    post,
    isPlaying: index === 0,
    isMuted: true,
    pipEnabled: false,
  }));

export function ReelsPage() {
  const reelPosts = useMemo(
    () => [...mockCommunityData, ...expandedMockPosts].filter(hasVideoMedia).map(normalizeToVideoFirst),
    []
  );

  const [reels, setReels] = useState<ReelPost[]>(() => createReels(reelPosts));
  const [reelLikes, setReelLikes] = useState<Record<string, number>>({});
  const [reelComments, setReelComments] = useState<Record<string, number>>({});
  const [likedByMe, setLikedByMe] = useState<Record<string, boolean>>({});

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    setReels(createReels(reelPosts));
    setCurrentIndex(0);
    const parseCount = (stats: string, keyword: string): number => {
      const match = stats.toLowerCase().match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(k)?\\s*${keyword}`));
      if (!match) return 0;
      const base = Number(match[1]);
      if (!Number.isFinite(base)) return 0;
      return match[2] ? Math.round(base * 1000) : Math.round(base);
    };

    const nextLikes: Record<string, number> = {};
    const nextComments: Record<string, number> = {};
    for (const post of reelPosts) {
      nextLikes[post.id] = Math.max(0, Math.round(post.engagement?.likes || parseCount(post.stats || '', 'likes?')));
      nextComments[post.id] = Math.max(0, Math.round(post.engagement?.comments || parseCount(post.stats || '', 'comments?')));
    }
    setReelLikes(nextLikes);
    setReelComments(nextComments);
    setLikedByMe({});
  }, [reelPosts]);

  useEffect(() => {
    setReels((prev) =>
      prev.map((reel, idx) => ({
        ...reel,
        isPlaying: idx === currentIndex,
      }))
    );
  }, [currentIndex]);

  useEffect(() => {
    const activeVideo = videoRefs.current[currentIndex];
    const activeReel = reels[currentIndex];
    if (!activeVideo || !activeReel) return;

    activeVideo.muted = activeReel.isMuted;
    if (activeReel.isPlaying) {
      void activeVideo.play().catch(() => {
        // Ignore autoplay restrictions if browser blocks play without gesture.
      });
    } else {
      activeVideo.pause();
    }
  }, [currentIndex, likedByMe, reels]);

  const currentReel = reels[currentIndex] ?? null;

  // Handle smooth scrolling to reel
  const scrollToReel = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, reels.length - 1)));
  }, [reels.length]);

  const togglePlayPause = useCallback(() => {
    setReels(prev =>
      prev.map((reel, idx) => {
        if (idx === currentIndex) {
          return { ...reel, isPlaying: !reel.isPlaying };
        }
        return { ...reel, isPlaying: false };
      })
    );
  }, [currentIndex]);

  const toggleMute = useCallback(() => {
    setReels(prev =>
      prev.map((reel, idx) => {
        if (idx === currentIndex) {
          return { ...reel, isMuted: !reel.isMuted };
        }
        return reel;
      })
    );
  }, [currentIndex]);

  const toggleReelLike = useCallback(() => {
    const postId = reels[currentIndex]?.post.id;
    if (!postId) return;

    const currentlyLiked = Boolean(likedByMe[postId]);
    const nextLiked = !currentlyLiked;
    setLikedByMe((current) => ({ ...current, [postId]: nextLiked }));
    setReelLikes((likes) => {
      const currentLikes = likes[postId] || 0;
      return {
        ...likes,
        [postId]: nextLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
      };
    });
  }, [currentIndex, reels]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToReel(currentIndex - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToReel(currentIndex + 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, scrollToReel, toggleMute, togglePlayPause]);

  const togglePiPPreference = () => {
    setReels(prev =>
      prev.map((reel, idx) => {
        if (idx === currentIndex) {
          return { ...reel, pipEnabled: !reel.pipEnabled };
        }
        return reel;
      })
    );
  };

  const togglePictureInPicture = async () => {
    const video = videoRefs.current[currentIndex];
    if (!video || typeof document === 'undefined' || !document.pictureInPictureEnabled || !currentReel?.pipEnabled) {
      return;
    }

    try {
      if (document.pictureInPictureElement === video) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // Ignore browser-level PiP restrictions.
    }
  };

  if (reels.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-slate-300">
        No reel videos available right now.
      </div>
    );
  }

  // Render media based on type
  const renderReelMedia = (media: MediaItem[], isPlaying: boolean, isMuted: boolean) => {
    if (!media || media.length === 0) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <p className="text-slate-400">No media available</p>
        </div>
      );
    }

    const primaryMedia = media[0];

    if (primaryMedia.mediaType === 'video') {
      const src = assetUrl(primaryMedia.url);
      if (!src) {
        return (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <p className="text-slate-400">Video source unavailable</p>
          </div>
        );
      }

      return (
        <div className="relative w-full h-full bg-black group">
          <video
            ref={el => (videoRefs.current[currentIndex] = el)}
            src={src}
            className="w-full h-full object-cover"
            muted={isMuted}
            autoPlay
            controls
            playsInline
            loop
            preload="metadata"
          />
          {/* Play/Pause Overlay */}
          <div
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors cursor-pointer"
          >
            {!isPlaying && (
              <div className="bg-white/80 p-4 rounded-full hover:bg-white transition-colors">
                <Play className="w-12 h-12 text-black fill-black" />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (primaryMedia.mediaType === 'audio') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center gap-6 p-8">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500/40 to-blue-500/40 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-16 h-16 text-purple-300 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M18 3a1 1 0 00-1.196-.15l-1 .5A1 1 0 0014 4.001V16a2 2 0 11-4 0V4.001a1 1 0 00-1.604-.82l-1 .5a1 1 0 11-.992-1.736l1-0.5A3 3 0 0114 1.001V16a4 4 0 108 0V3z" />
            </svg>
          </div>
          <div className="text-center max-w-sm">
            <h3 className="text-xl font-semibold text-white mb-2">Audio Content</h3>
            <p className="text-slate-300 text-sm mb-6">{currentPost.title}</p>
          </div>
          <audio
            controls
            src={primaryMedia.url}
            className="w-full max-w-xs"
            autoPlay={isPlaying}
          />
        </div>
      );
    }

    if (primaryMedia.mediaType === 'image') {
      return (
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={primaryMedia.url}
            alt={primaryMedia.fileName}
            className="w-full h-full object-cover"
          />
          {media.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
              1 of {media.length}
            </div>
          )}
        </div>
      );
    }

    if (primaryMedia.mediaType === 'document') {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-900 via-[#1A1D2B] to-slate-950 flex items-center justify-center p-8">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-[#BED234]/20 p-3 text-[#BED234]">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Article / Document</p>
                <p className="text-sm font-semibold text-white">{primaryMedia.fileName}</p>
              </div>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">Open the project article, safety bulletin, or technical method statement in a new tab.</p>
            <a
              href={primaryMedia.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#BED234] px-4 py-2 text-sm font-semibold text-[#121420]"
            >
              <ExternalLink className="h-4 w-4" /> Open document
            </a>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Main Reel Container */}
      <div
        ref={containerRef}
        className="relative w-full h-screen"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {reels.map((reel, idx) => (
          <div
            key={reel.post.id}
            className={cn(
              'absolute inset-0 w-full h-screen transition-opacity duration-300',
              idx === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            {/* Media Display */}
            <div className="relative w-full h-full">
              {renderReelMedia(reel.post.media, reel.isPlaying, reel.isMuted)}

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50 pointer-events-none" />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
                {/* Header */}
                <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pb-32">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                    <div>
                      <p className="text-white font-semibold text-sm">{reel.post.author}</p>
                      <p className="text-slate-300 text-xs">{reel.post.field}</p>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h2 className="text-white font-bold text-lg mb-2 leading-tight">
                    {reel.post.title}
                  </h2>
                  <p className="text-slate-100 text-sm leading-relaxed line-clamp-2">
                    {reel.post.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {reel.post.interests.map(interest => (
                      <span
                        key={interest}
                        className="text-xs px-2 py-1 bg-white/10 text-white rounded-full border border-white/20"
                      >
                        #{interest}
                      </span>
                    ))}
                  </div>

                  {/* Engagement Stats */}
                  <p className="text-slate-300 text-xs mt-3">{reel.post.stats}</p>
                </div>
              </div>

              {/* Right Side Controls */}
              <div className="absolute right-4 bottom-24 flex flex-col gap-6 pointer-events-auto z-10">
                {/* Like Button */}
                <button onClick={toggleReelLike} className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
                    <Heart className={cn('w-6 h-6', likedByMe[reel.post.id] ? 'fill-red-400 text-red-400' : 'text-white')} />
                  </div>
                  <span className="text-white text-xs font-medium group-hover:text-red-400 transition-colors">
                    {reelLikes[reel.post.id] ?? 0}
                  </span>
                </button>

                {/* Comment Button */}
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {reelComments[reel.post.id] ?? 0}
                  </span>
                </button>

                {/* Share Button */}
                <button className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-white text-xs font-medium">
                    {Math.floor(Math.random() * 200)}
                  </span>
                </button>

                {/* Mute Button (for videos) */}
                {reel.post.media[0]?.mediaType === 'video' && (
                  <>
                    <button
                      onClick={toggleMute}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
                        {reel.isMuted ? (
                          <VolumeX className="w-6 h-6 text-white" />
                        ) : (
                          <Volume2 className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <span className="text-white text-[10px] font-medium">{reel.isMuted ? 'Muted' : 'Audio'}</span>
                    </button>

                    <button
                      onClick={togglePiPPreference}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
                        <PictureInPicture2 className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-[10px] font-medium">{reel.pipEnabled ? 'PiP on' : 'PiP off'}</span>
                    </button>

                    {reel.pipEnabled && (
                      <button
                        onClick={() => void togglePictureInPicture()}
                        className="flex flex-col items-center gap-1 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
                          <PictureInPicture2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white text-[10px] font-medium">Open PiP</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Navigation Arrows */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-auto z-20">
                <button
                  onClick={() => scrollToReel(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronUp className="w-6 h-6 text-white" />
                </button>

                <button
                  onClick={() => scrollToReel(currentIndex + 1)}
                  disabled={currentIndex === reels.length - 1}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all hover:scale-110"
                >
                  <ChevronDown className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Bottom Progress Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / reels.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Keyboard Hints (bottom left) */}
      <div className="absolute bottom-6 left-6 text-slate-400 text-xs pointer-events-none">
        <p>↑↓ Navigate • Space Play • M Mute</p>
      </div>

      {/* Reel Counter */}
      <div className="absolute top-6 left-6 text-white font-medium text-sm pointer-events-none">
        {currentIndex + 1} / {reels.length}
      </div>
    </div>
  );
}
