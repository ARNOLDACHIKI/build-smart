import type { CommunityFeedResponse } from '@/lib/community';
import type { LocalItem } from './types';

const scoreForPersona = (item: LocalItem, persona: CommunityFeedResponse['personalization']) => {
  let score = 0;
  const inferred = persona.inferredField.toLowerCase();
  const role = persona.role.toLowerCase();
  const tokens = persona.interestTokens.map((token) => token.toLowerCase());

  if (item.field.toLowerCase() === inferred) score += 4;
  if (item.tags.some((tag) => tokens.includes(tag.toLowerCase()))) score += 3;
  if (item.author.toLowerCase().includes(role)) score += 1;
  if (item.verified) score += 1;
  return score;
};

export const sortByPersona = <T extends LocalItem>(items: T[], persona: CommunityFeedResponse['personalization']): T[] => {
  return [...items].sort((a, b) => {
    const scoreDelta = scoreForPersona(b, persona) - scoreForPersona(a, persona);
    if (scoreDelta !== 0) return scoreDelta;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const filterBySearch = <T extends LocalItem>(items: T[], query: string): T[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter((item) => {
    const haystack = [item.title, item.summary, item.author, item.field, item.location, item.tags.join(' ')].join(' ').toLowerCase();
    return haystack.includes(normalized);
  });
};
