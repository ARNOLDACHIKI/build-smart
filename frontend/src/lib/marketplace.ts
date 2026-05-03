import { apiUrl } from '@/lib/api';
import { authStorage } from '@/lib/auth';

export type MarketplaceMatch = {
  id: string;
  inquiryId: string;
  professionalId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  note: string | null;
  createdAt: string;
  updatedAt: string;
  respondedAt: string | null;
  professional?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    company: string | null;
    location: string | null;
  };
};

export type MarketplaceInquiry = {
  id: string;
  title: string | null;
  description: string | null;
  budget: string | null;
  location: string | null;
  category: string | null;
  createdById: string | null;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  message: string;
  status: string;
  marketplaceStatus: 'OPEN' | 'MATCHED' | 'CLOSED';
  matchedProfessionalId: string | null;
  createdAt: string;
  updatedAt: string;
  matches?: MarketplaceMatch[];
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    company: string | null;
    location: string | null;
  } | null;
  matchedProfessional?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    company: string | null;
    location: string | null;
  } | null;
};

type MarketplaceInquiryListResponse = {
  inquiries: MarketplaceInquiry[];
  matches: MarketplaceMatch[];
  summary: {
    openCount: number;
    matchedCount: number;
  };
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = authStorage.getToken();
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error || 'Marketplace request failed');
  }

  return payload as T;
};

export const getMarketplaceInquiries = async (params?: {
  status?: 'open' | 'matched' | 'closed';
  category?: string;
  location?: string;
}): Promise<MarketplaceInquiryListResponse> => {
  const query = new URLSearchParams();
  query.set('scope', 'marketplace');
  if (params?.status) query.set('status', params.status);
  if (params?.category) query.set('category', params.category);
  if (params?.location) query.set('location', params.location);
  return request<MarketplaceInquiryListResponse>(`/api/inquiries?${query.toString()}`);
};

export const createMarketplaceInquiry = async (payload: {
  title: string;
  description: string;
  budget?: string;
  location?: string;
  category?: string;
}): Promise<{ inquiry: MarketplaceInquiry }> => {
  return request<{ inquiry: MarketplaceInquiry }>("/api/inquiries", {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const createMarketplaceMatch = async (payload: {
  inquiryId: string;
  professionalId: string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  note?: string;
}): Promise<{ match: MarketplaceMatch }> => {
  return request<{ match: MarketplaceMatch }>("/api/match", {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
