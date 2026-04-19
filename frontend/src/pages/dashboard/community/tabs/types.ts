import type { CommunityFeedResponse } from '@/lib/community';
import type { FeedDensity, LocalItem } from '../types';

export type TabComponentProps = {
  persona: CommunityFeedResponse['personalization'];
  search: string;
  density: FeedDensity;
  isMutating: boolean;
  bookmarks: Record<string, boolean>;
  follows: Record<string, boolean>;
  votes: Record<string, 'up' | 'down' | null>;
  onBookmark: (id: string) => Promise<void>;
  onFollow: (id: string) => Promise<void>;
  onVote: (id: string, vote: 'up' | 'down') => Promise<void>;
};

export type TabItemsBuilder = (persona: CommunityFeedResponse['personalization'], search: string) => LocalItem[];
