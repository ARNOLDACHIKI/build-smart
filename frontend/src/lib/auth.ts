import { apiUrl } from "@/lib/api";
import type { AppRole } from "@/lib/roles";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  profilePicture?: string | null;
  phone?: string | null;
  bio?: string | null;
  company?: string | null;
  registrationNo?: string | null;
  industry?: string | null;
  location?: string | null;
  role: AppRole;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type TwoFactorVerifyResponse = AuthResponse;

export type RegisterResponse = {
  user: AuthUser;
  token?: string;
  message?: string;
  emailVerificationRequired?: boolean;
  verificationEmail?: string;
};

export type ApiRequestError = Error & {
  status?: number;
  data?: Record<string, unknown>;
};

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error("Unable to reach API server. Please check backend availability.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (data as { error?: string }).error || "Request failed";
    const error = new Error(message) as ApiRequestError;
    error.status = response.status;
    error.data = data as Record<string, unknown>;
    throw error;
  }

  return data as T;
};

export const authStorage = {
  getToken: () => localStorage.getItem(AUTH_TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(AUTH_TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(AUTH_TOKEN_KEY),
  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  setUser: (user: AuthUser) => localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)),
  clearUser: () => localStorage.removeItem(AUTH_USER_KEY),
  clear: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },
};

export const registerUser = async (payload: {
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  password: string;
  role?: AppRole;
}): Promise<RegisterResponse> => {
  return request<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchCurrentUser = async (token: string): Promise<AuthUser> => {
  const data = await request<{ user: AuthUser }>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.user;
};

export const verifyEmailCode = async (payload: {
  email: string;
  code: string;
}): Promise<AuthResponse> => {
  return request<AuthResponse>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const resendVerificationCode = async (payload: {
  email: string;
}): Promise<{ message: string }> => {
  return request<{ message: string }>("/api/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const verifyTwoFactorCode = async (payload: {
  email: string;
  code: string;
}): Promise<TwoFactorVerifyResponse> => {
  return request<TwoFactorVerifyResponse>("/api/auth/verify-two-factor", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const resendTwoFactorCode = async (payload: {
  email: string;
}): Promise<{ message: string }> => {
  return request<{ message: string }>("/api/auth/resend-two-factor", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const forgotPassword = async (payload: {
  email: string;
}): Promise<{ message: string }> => {
  return request<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const resetPassword = async (payload: {
  email: string;
  token: string;
  password: string;
}): Promise<{ message: string }> => {
  return request<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
