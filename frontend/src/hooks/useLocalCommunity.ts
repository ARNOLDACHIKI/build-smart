import { useCallback, useEffect, useMemo, useState } from 'react';
import { mockPosts, generateMockPosts } from '@/lib/mockPosts';
import type { CommunityPost } from '@/lib/community';

type VoteMap = Record<string, number>; // postId -> score (sum of user votes) -- single-user local toggle
type UserVoteMap = Record<string, number>; // postId -> -1|0|1 for this user

type Comment = {
  id: string;
  postId: string;
  parentId?: string | null;
  author: { id: string; name?: string | null };
  text: string;
  createdAt: string;
};

type Answer = {
  id: string;
  threadId: string;
  author: { id: string; name?: string };
  text: string;
  votes: number;
  isBest?: boolean;
  createdAt: string;
};

type Thread = {
  id: string;
  channelId: string;
  title: string;
  createdBy: { id: string; name?: string };
  createdAt: string;
  type?: 'question' | 'discussion' | 'announcement';
  linkedProjectId?: string | null;
  tags?: string[];
  messages?: Comment[];
  answers?: Answer[];
};

const POSTS_KEY = 'local_community_posts_v1';
const VOTES_KEY = 'local_community_votes_v1';
const USERVOTES_KEY = 'local_community_uservotes_v1';
const SAVED_KEY = 'local_community_saved_v1';
const COMMENTS_KEY = 'local_community_comments_v1';
const THREADS_KEY = 'local_community_threads_v1';
const ANSWERS_KEY = 'local_community_answers_v1';
const KNOWLEDGE_KEY = 'local_community_kb_v1';

const uuid = () => Math.random().toString(36).slice(2, 9);

export const useLocalCommunity = () => {
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    try {
      const raw = localStorage.getItem(POSTS_KEY);
      if (raw) return JSON.parse(raw) as CommunityPost[];
    } catch {}
    // fall back to large mock set
    return mockPosts.slice(0, 150);
  });

  const [votes, setVotes] = useState<VoteMap>(() => {
    try {
      const raw = localStorage.getItem(VOTES_KEY);
      if (raw) return JSON.parse(raw) as VoteMap;
    } catch {}
    return {};
  });

  const [userVotes, setUserVotes] = useState<UserVoteMap>(() => {
    try {
      const raw = localStorage.getItem(USERVOTES_KEY);
      if (raw) return JSON.parse(raw) as UserVoteMap;
    } catch {}
    return {};
  });

  const [saved, setSaved] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) return JSON.parse(raw) as Record<string, boolean>;
    } catch {}
    return {};
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const raw = localStorage.getItem(COMMENTS_KEY);
      if (raw) return JSON.parse(raw) as Comment[];
    } catch {}
    return [];
  });

  const [threads, setThreads] = useState<Thread[]>(() => {
    try {
      const raw = localStorage.getItem(THREADS_KEY);
      if (raw) return JSON.parse(raw) as Thread[];
    } catch {}
    return [];
  });

  const [answers, setAnswers] = useState<Answer[]>(() => {
    try {
      const raw = localStorage.getItem(ANSWERS_KEY);
      if (raw) return JSON.parse(raw) as Answer[];
    } catch {}
    return [];
  });

  const [knowledgeBase, setKnowledgeBase] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem(KNOWLEDGE_KEY);
      if (raw) return JSON.parse(raw) as any[];
    } catch {}
    return [];
  });

  useEffect(() => localStorage.setItem(POSTS_KEY, JSON.stringify(posts)), [posts]);
  useEffect(() => localStorage.setItem(VOTES_KEY, JSON.stringify(votes)), [votes]);
  useEffect(() => localStorage.setItem(USERVOTES_KEY, JSON.stringify(userVotes)), [userVotes]);
  useEffect(() => localStorage.setItem(SAVED_KEY, JSON.stringify(saved)), [saved]);
  useEffect(() => localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments)), [comments]);
  useEffect(() => localStorage.setItem(THREADS_KEY, JSON.stringify(threads)), [threads]);
  useEffect(() => localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers)), [answers]);
  useEffect(() => localStorage.setItem(KNOWLEDGE_KEY, JSON.stringify(knowledgeBase)), [knowledgeBase]);

  const addPost = useCallback((payload: { title: string; content?: string; tags?: string[]; media?: any[]; author?: { id: string; name?: string } }) => {
    const p: CommunityPost = {
      id: `local_${uuid()}`,
      title: payload.title,
      summary: payload.content || '',
      author: { id: payload.author?.id || 'local_user', name: payload.author?.name || 'You' } as any,
      field: 'Construction',
      interests: payload.tags || [],
      media: payload.media || [],
      type: 'Discussion',
      createdAt: new Date().toISOString(),
      stats: { likes: 0, comments: 0 },
    } as unknown as CommunityPost;

    setPosts((prev) => [p, ...prev]);
    return p;
  }, []);

  const toggleSave = useCallback((postId: string) => {
    setSaved((prev) => {
      const next = { ...prev, [postId]: !prev[postId] };
      return next;
    });
  }, []);

  const vote = useCallback((postId: string, value: -1 | 1) => {
    setUserVotes((prev) => {
      const prevVal = prev[postId] || 0;
      const nextVal = prevVal === value ? 0 : value;
      const delta = nextVal - prevVal;
      setVotes((v) => ({ ...(v || {}), [postId]: (v[postId] || 0) + delta }));
      return { ...prev, [postId]: nextVal };
    });
  }, []);

  const addComment = useCallback((postId: string, text: string, parentId?: string | null, author = { id: 'local_user', name: 'You' }) => {
    const c: Comment = { id: uuid(), postId, parentId: parentId || null, author, text, createdAt: new Date().toISOString() };
    setComments((prev) => [c, ...prev]);
    // increment post comment count
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, stats: { ...(p.stats as any), comments: ((p.stats as any)?.comments || 0) + 1 } } : p)));
    return c;
  }, []);

  const getCommentsForPost = useCallback((postId: string) => comments.filter((c) => c.postId === postId), [comments]);

  const ensureMorePosts = useCallback((count = 50) => {
    // append generated mock posts if low
    if (posts.length < 400) {
      const more = generateMockPosts(count, posts.length + 1);
      setPosts((p) => [...p, ...more]);
    }
  }, [posts.length]);
  const createThread = useCallback((payload: { channelId?: string; title: string; type?: Thread['type']; tags?: string[]; linkedProjectId?: string | null; author?: { id: string; name?: string } }) => {
    const t: Thread = {
      id: `thread_${uuid()}`,
      channelId: payload.channelId || 'general',
      title: payload.title,
      createdBy: payload.author || { id: 'local_user', name: 'You' },
      createdAt: new Date().toISOString(),
      type: payload.type || 'discussion',
      linkedProjectId: payload.linkedProjectId || null,
      tags: payload.tags || [],
      messages: [],
      answers: [],
    };
    setThreads((prev) => [t, ...prev]);
    return t;
  }, []);

  const postThreadMessage = useCallback((threadId: string, text: string, author = { id: 'local_user', name: 'You' }) => {
    const msg: Comment = { id: uuid(), postId: threadId, parentId: null, author, text, createdAt: new Date().toISOString() };
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, messages: [msg, ...(t.messages || [])] } : t)));
    // also keep in comments list for compatibility
    setComments((prev) => [msg, ...prev]);
    return msg;
  }, []);

  const postAnswer = useCallback((threadId: string, text: string, author = { id: 'local_user', name: 'You' }) => {
    const a: Answer = { id: `ans_${uuid()}`, threadId, author, text, votes: 0, isBest: false, createdAt: new Date().toISOString() };
    setAnswers((prev) => [a, ...prev]);
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, answers: [a, ...(t.answers || [])] } : t)));
    return a;
  }, []);

  const voteAnswer = useCallback((answerId: string, value: -1 | 1) => {
    setAnswers((prev) => prev.map((a) => (a.id === answerId ? { ...a, votes: (a.votes || 0) + value } : a)));
    setThreads((prev) => prev.map((t) => ({ ...t, answers: (t.answers || []).map((a) => (a.id === answerId ? { ...a, votes: (a.votes || 0) + value } : a)) } )));
  }, []);

  const markBestAnswer = useCallback((answerId: string) => {
    const target = answers.find((a) => a.id === answerId);
    if (!target) return;
    const threadId = target.threadId;
    setAnswers((prev) => prev.map((a) => (a.threadId === threadId ? { ...a, isBest: a.id === answerId } : a)));
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, answers: (t.answers || []).map((a) => ({ ...a, isBest: a.id === answerId })) } : t)));
  }, [answers]);

  const promoteToKnowledge = useCallback((threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return null;
    const entry = { id: `kb_${uuid()}`, title: thread.title, content: (thread.messages || []).map((m) => m.text).join('\n\n'), sourceThreadId: thread.id, tags: thread.tags || [], createdAt: new Date().toISOString() };
    setKnowledgeBase((prev) => [entry, ...prev]);
    return entry;
  }, [threads]);

  const searchThreads = useCallback((q: string) => {
    const term = q.trim().toLowerCase();
    if (!term) return threads;
    return threads.filter((t) => {
      if (t.title.toLowerCase().includes(term)) return true;
      if ((t.tags || []).some((tg) => tg.toLowerCase().includes(term))) return true;
      if ((t.messages || []).some((m) => m.text.toLowerCase().includes(term))) return true;
      if ((t.answers || []).some((a) => a.text.toLowerCase().includes(term))) return true;
      return false;
    });
  }, [threads]);

  const aiSuggestAnswer = useCallback(async (threadId: string) => {
    const t = threads.find((x) => x.id === threadId);
    if (!t) return 'No thread found';
    const seed = [t.title, ...(t.messages || []).slice(0, 2).map((m) => m.text)].join('\n\n');
    await new Promise((r) => setTimeout(r, 250));
    return `Suggested answer (AI stub): Based on the thread "${t.title}", consider: ${seed.slice(0, 240)}${seed.length > 240 ? '...' : ''}`;
  }, [threads]);

  return useMemo(() => ({ posts, addPost, toggleSave, saved, vote, votes, userVotes, comments, addComment, getCommentsForPost, ensureMorePosts, threads, createThread, postThreadMessage, answers, postAnswer, voteAnswer, markBestAnswer, promoteToKnowledge, searchThreads, knowledgeBase, aiSuggestAnswer }), [posts, addPost, toggleSave, saved, vote, votes, userVotes, comments, addComment, getCommentsForPost, ensureMorePosts, threads, createThread, postThreadMessage, answers, postAnswer, voteAnswer, markBestAnswer, promoteToKnowledge, searchThreads, knowledgeBase, aiSuggestAnswer]);
};

export type { Comment, Thread, Answer };
