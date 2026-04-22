import { createContext, useContext, useState, ReactNode } from 'react';
import type { CommunityActivityNotification, CommunityPost } from '@/lib/community';

type ActivityContextType = {
  isActivityOpen: boolean;
  setIsActivityOpen: (open: boolean) => void;
  activityNotifications: CommunityActivityNotification[];
  setActivityNotifications: (notifications: CommunityActivityNotification[]) => void;
  activityUnreadCount: number;
  setActivityUnreadCount: (count: number) => void;
  followIds: string[];
  setFollowIds: (ids: string[]) => void;
  bookmarkIds: string[];
  setBookmarkIds: (ids: string[]) => void;
  savedPosts: CommunityPost[];
  setSavedPosts: (posts: CommunityPost[]) => void;
};

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider = ({ children }: { children: ReactNode }) => {
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [activityNotifications, setActivityNotifications] = useState<CommunityActivityNotification[]>([]);
  const [activityUnreadCount, setActivityUnreadCount] = useState(0);
  const [followIds, setFollowIds] = useState<string[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<CommunityPost[]>([]);

  return (
    <ActivityContext.Provider
      value={{
        isActivityOpen,
        setIsActivityOpen,
        activityNotifications,
        setActivityNotifications,
        activityUnreadCount,
        setActivityUnreadCount,
        followIds,
        setFollowIds,
        bookmarkIds,
        setBookmarkIds,
        savedPosts,
        setSavedPosts,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};
