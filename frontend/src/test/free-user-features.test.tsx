import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Search from "@/pages/Search";

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/components/landing/Navbar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("@/lib/api", () => ({
  apiUrl: (path: string) => path,
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const translationMap: Record<string, string> = {
  "common.back": "Back",
  "search.title": "Find Construction Professionals",
  "search.subtitle": "Search professionals across Kenya",
  "hero.searchPlaceholder": "Initiate your query",
  "search.results": "Results",
  "search.viewProfile": "View Profile",
  "search.contact": "Contact",
  "search.freeModeBanner": "You are browsing as a free user. Login to unlock dashboards, saved requests, and team collaboration.",
};

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => translationMap[key] || key,
  }),
}));

const mockFetch = vi.fn();

const toJsonResponse = (data: unknown, ok = true) => ({
  ok,
  json: async () => data,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
});

describe("Free user feature checks", () => {
  it("shows free-mode banner and allows navigation to login", async () => {
    mockFetch.mockResolvedValueOnce(toJsonResponse({ engineers: [] }));

    render(
      <MemoryRouter initialEntries={["/search?mode=free"]}>
        <Routes>
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("You are browsing as a free user. Login to unlock dashboards, saved requests, and team collaboration.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Go to Login" }));
    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("loads professional results for free browsing and supports filtering", async () => {
    mockFetch.mockResolvedValueOnce(
      toJsonResponse({
        engineers: [
          {
            id: "eng-1",
            name: "Eng Jane Doe",
            email: "jane@example.com",
            company: "BuildCo",
            location: "Nairobi",
            bio: "Structural engineer",
          },
        ],
      })
    );

    render(
      <MemoryRouter initialEntries={["/search"]}>
        <Routes>
          <Route path="/search" element={<Search />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Eng Jane Doe")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Initiate your query");
    fireEvent.change(searchInput, { target: { value: "no-match-query" } });

    await waitFor(() => {
      expect(screen.getByText("0 Results")).toBeInTheDocument();
    });
  });

  it("lets free users send an inquiry from search", async () => {
    mockFetch
      .mockResolvedValueOnce(
        toJsonResponse({
          engineers: [
            {
              id: "eng-1",
              name: "Eng Jane Doe",
              email: "jane@example.com",
              company: "BuildCo",
              location: "Nairobi",
              bio: "Structural engineer",
            },
          ],
        })
      )
      .mockResolvedValueOnce(toJsonResponse({ ok: true }));

    render(
      <MemoryRouter initialEntries={["/search?mode=free"]}>
        <Routes>
          <Route path="/search" element={<Search />} />
        </Routes>
      </MemoryRouter>
    );

    const contactButton = await screen.findAllByRole("button", { name: "Contact" });
    fireEvent.click(contactButton[0]);

    fireEvent.change(screen.getByLabelText("Your Name *"), { target: { value: "Free User" } });
    fireEvent.change(screen.getByLabelText("Your Email *"), { target: { value: "free.user@example.com" } });
    fireEvent.change(screen.getByLabelText("Message *"), { target: { value: "I need support with a project." } });

    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/inquiries",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(toastSuccess).toHaveBeenCalled();
  });
});
