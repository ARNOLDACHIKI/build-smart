import { mockUsers } from './mockUsers';
import { generateMockPost } from './mockPosts';
import type { CommunityPost } from './community';

export type SimulatedActivity = {
  type: 'post' | 'like' | 'comment' | 'follow';
  postId: string;
  user: string;
  timestamp: string;
};

export class MockActivityEngine {
  private isRunning = false;
  private activityCallbacks: Array<(activity: SimulatedActivity) => void> = [];
  private postCallbacks: Array<(post: CommunityPost) => void> = [];
  private intervals: NodeJS.Timeout[] = [];
  private postIdCounter = 150;

  // Register callback for activity updates
  onActivity(callback: (activity: SimulatedActivity) => void) {
    this.activityCallbacks.push(callback);
  }

  // Register callback for new posts
  onNewPost(callback: (post: CommunityPost) => void) {
    this.postCallbacks.push(callback);
  }

  private emitActivity(activity: SimulatedActivity) {
    this.activityCallbacks.forEach((cb) => cb(activity));
  }

  private emitPost(post: CommunityPost) {
    this.postCallbacks.forEach((cb) => cb(post));
  }

  // Start generating random activity
  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Every 8-15 seconds, add a new post
    const newPostInterval = setInterval(() => {
      if (!this.isRunning) return;
      const newPost = generateMockPost(this.postIdCounter++);
      this.emitPost(newPost);
    }, 8000 + Math.random() * 7000);

    // Every 3-6 seconds, simulate a like
    const likeInterval = setInterval(() => {
      if (!this.isRunning) return;
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomPostId = `demo_post_${Math.floor(Math.random() * 150)}`;
      this.emitActivity({
        type: 'like',
        postId: randomPostId,
        user: randomUser.name,
        timestamp: new Date().toISOString(),
      });
    }, 3000 + Math.random() * 3000);

    // Every 10-20 seconds, simulate a comment
    const commentInterval = setInterval(() => {
      if (!this.isRunning) return;
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomPostId = `demo_post_${Math.floor(Math.random() * 150)}`;
      this.emitActivity({
        type: 'comment',
        postId: randomPostId,
        user: randomUser.name,
        timestamp: new Date().toISOString(),
      });
    }, 10000 + Math.random() * 10000);

    // Every 15-30 seconds, simulate a follow
    const followInterval = setInterval(() => {
      if (!this.isRunning) return;
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomPostId = `demo_post_${Math.floor(Math.random() * 150)}`;
      this.emitActivity({
        type: 'follow',
        postId: randomPostId,
        user: randomUser.name,
        timestamp: new Date().toISOString(),
      });
    }, 15000 + Math.random() * 15000);

    this.intervals = [newPostInterval, likeInterval, commentInterval, followInterval];
  }

  // Stop generating activity
  stop() {
    this.isRunning = false;
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals = [];
  }

  // Clear all callbacks
  destroy() {
    this.stop();
    this.activityCallbacks = [];
    this.postCallbacks = [];
  }
}

export const createMockActivityEngine = () => new MockActivityEngine();
