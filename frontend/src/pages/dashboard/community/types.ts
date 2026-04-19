import type { CommunityFeedResponse } from '@/lib/community';

export type CommunityTab = 'all' | 'articles' | 'videos' | 'discussions' | 'reports' | 'audio' | 'marketplace';

export type MinimalFilter = 'all' | 'articles' | 'videos' | 'discussions' | 'reports' | 'audio' | 'marketplace';

export type FeedDensity = 'comfortable' | 'compact';

export type LocalItem = {
  id: string;
  title: string;
  summary: string;
  field: string;
  tags: string[];
  location: string;
  contentTypes: string[];
  author: string;
  metrics: string;
  createdAt: string;
  kind?: string;
  verified?: boolean;
  replies?: string;
  votes?: string;
  status?: string;
  budget?: string;
  badges?: string[];
  privacy?: string;
  media?: Array<{
    url: string;
    mediaType: 'image' | 'video' | 'audio' | 'document';
    fileName: string;
    thumbnailUrl?: string;
  }>;
  liveSession?: {
    title: string;
    startsAt: string;
    roomUrl: string;
    roomId?: string;
    description?: string;
  } | null;
  canDelete?: boolean;
};

export type FeedItem = LocalItem & {
  source: 'api' | 'local';
};

export type CommunityUiState = {
  bookmarks: Record<string, boolean>;
  follows: Record<string, boolean>;
  votes: Record<string, 'up' | 'down' | null>;
  pollVotes: Record<string, string>;
};

export type CommunityPersona = CommunityFeedResponse['personalization'];
