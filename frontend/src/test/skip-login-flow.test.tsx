import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";

const translationMap: Record<string, string> = {
  "nav.login": "Login",
  "nav.skipLogin": "Skip Login",
  "auth.skipLoginFree": "Skip Login (Free User)",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.rememberMe": "Remember me",
  "auth.forgotPassword": "Forgot Password?",
  "auth.signupInstead": "Don't have an account? Sign Up",
};

const loginMock = vi.fn();
const toastMock = vi.fn();

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string) => translationMap[key] || key,
  }),
}));

vi.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    toggleTheme: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

let mockAuthState = {
  isAuthenticated: false,
  isHydrating: false,
  user: null,
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    ...mockAuthState,
    login: loginMock,
  }),
}));

vi.mock("@/lib/auth", () => ({
  authStorage: {
    getUser: () => null,
  },
}));

describe("Skip login flow", () => {
  it("shows login and skip login actions in landing navbar", () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getAllByRole("link", { name: "Login" }).length).toBeGreaterThan(0);

    const skipLoginLinks = screen.getAllByRole("link", { name: "Skip Login" });
    expect(skipLoginLinks.length).toBeGreaterThan(0);
    expect(skipLoginLinks[0]).toHaveAttribute("href", "/search?mode=free");
  });

  it("navigates to free search when skip login is clicked on login page", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<div>Free Search Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Skip Login (Free User)" }));

    expect(await screen.findByText("Free Search Page")).toBeInTheDocument();
  });

  it("still redirects unauthenticated users from protected routes to login", async () => {
    mockAuthState = { isAuthenticated: false, isHydrating: false, user: null };

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <div>Protected Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });
});
