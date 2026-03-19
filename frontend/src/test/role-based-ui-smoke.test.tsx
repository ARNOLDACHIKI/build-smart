import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SPECIALIZED_PORTAL_ROLES, type AppRole } from "@/lib/roles";

type MockUser = {
  role?: AppRole;
};

type MockAuthState = {
  isAuthenticated: boolean;
  isHydrating: boolean;
  user: MockUser | null;
};

let mockAuthState: MockAuthState = {
  isAuthenticated: false,
  isHydrating: false,
  user: null,
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

const renderRoute = ({
  initialPath,
  protectedPath,
  element,
}: {
  initialPath: string;
  protectedPath: string;
  element: JSX.Element;
}) => {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>User Dashboard</div>} />
        <Route path="/admin" element={<div>Admin Home</div>} />
        <Route path="/engineer" element={<div>Engineer Home</div>} />
        <Route path="/portal" element={<div>Portal Home</div>} />
        <Route path={protectedPath} element={element} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Role-based UI smoke tests", () => {
  it("redirects unauthenticated users to login", async () => {
    mockAuthState = { isAuthenticated: false, isHydrating: false, user: null };

    renderRoute({
      initialPath: "/protected",
      protectedPath: "/protected",
      element: (
        <ProtectedRoute allowedRoles={["USER"]}>
          <div>User Dashboard</div>
        </ProtectedRoute>
      ),
    });

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("allows USER role in dashboard flow", async () => {
    mockAuthState = { isAuthenticated: true, isHydrating: false, user: { role: "USER" } };

    renderRoute({
      initialPath: "/protected",
      protectedPath: "/protected",
      element: (
        <ProtectedRoute allowedRoles={["USER"]}>
          <div>User Dashboard</div>
        </ProtectedRoute>
      ),
    });

    expect(await screen.findByText("User Dashboard")).toBeInTheDocument();
  });

  it("allows ADMIN role in admin flow", async () => {
    mockAuthState = { isAuthenticated: true, isHydrating: false, user: { role: "ADMIN" } };

    renderRoute({
      initialPath: "/protected",
      protectedPath: "/protected",
      element: (
        <ProtectedRoute requireAdmin>
          <div>Admin Home</div>
        </ProtectedRoute>
      ),
    });

    expect(await screen.findByText("Admin Home")).toBeInTheDocument();
  });

  it("redirects non-admin away from admin flow", async () => {
    mockAuthState = { isAuthenticated: true, isHydrating: false, user: { role: "USER" } };

    renderRoute({
      initialPath: "/protected",
      protectedPath: "/protected",
      element: (
        <ProtectedRoute requireAdmin>
          <div>Admin Home</div>
        </ProtectedRoute>
      ),
    });

    expect(await screen.findByText("User Dashboard")).toBeInTheDocument();
  });

  it("allows ENGINEER role in engineer flow", async () => {
    mockAuthState = { isAuthenticated: true, isHydrating: false, user: { role: "ENGINEER" } };

    renderRoute({
      initialPath: "/protected",
      protectedPath: "/protected",
      element: (
        <ProtectedRoute allowedRoles={["ENGINEER"]}>
          <div>Engineer Home</div>
        </ProtectedRoute>
      ),
    });

    expect(await screen.findByText("Engineer Home")).toBeInTheDocument();
  });

  it("allows specialized role in portal flow", async () => {
    mockAuthState = { isAuthenticated: true, isHydrating: false, user: { role: "CONTRACTOR" } };

    renderRoute({
      initialPath: "/protected",
      protectedPath: "/protected",
      element: (
        <ProtectedRoute allowedRoles={SPECIALIZED_PORTAL_ROLES}>
          <div>Portal Home</div>
        </ProtectedRoute>
      ),
    });

    expect(await screen.findByText("Portal Home")).toBeInTheDocument();
  });

  it("redirects USER away from portal flow", async () => {
    mockAuthState = { isAuthenticated: true, isHydrating: false, user: { role: "USER" } };

    renderRoute({
      initialPath: "/protected",
      protectedPath: "/protected",
      element: (
        <ProtectedRoute allowedRoles={SPECIALIZED_PORTAL_ROLES}>
          <div>Portal Home</div>
        </ProtectedRoute>
      ),
    });

    expect(await screen.findByText("User Dashboard")).toBeInTheDocument();
  });
});
