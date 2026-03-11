import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authStorage, fetchCurrentUser, loginUser, registerUser, type AuthUser } from "@/lib/auth";
import type { AppRole } from "@/lib/roles";

type LoginInput = {
  email: string;
  password: string;
};

type SignupInput = {
  name?: string;
  email: string;
  phone?: string;
  company?: string;
  password: string;
  role?: AppRole;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: AuthUser) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(authStorage.getUser());
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const currentToken = authStorage.getToken();
      if (!currentToken) {
        setIsHydrating(false);
        return;
      }

      try {
        const currentUser = await fetchCurrentUser(currentToken);
        setToken(currentToken);
        setUser(currentUser);
        authStorage.setUser(currentUser);
      } catch {
        authStorage.clear();
        setToken(null);
        setUser(null);
      } finally {
        setIsHydrating(false);
      }
    };

    void hydrate();
  }, []);

  const login = async (input: LoginInput) => {
    const data = await loginUser(input);
    setToken(data.token);
    setUser(data.user);
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
  };

  const signup = async (input: SignupInput) => {
    const data = await registerUser(input);
    setToken(data.token);
    setUser(data.user);
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
  };

  const logout = () => {
    authStorage.clear();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    authStorage.setUser(updatedUser);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isHydrating,
      login,
      signup,
      logout,
      updateUser,
    }),
    [user, token, isHydrating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
