import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Search from "@/pages/Search";

const translationMap: Record<string, string> = {
  "common.back": "Back",
  "search.title": "Find Construction Professionals",
  "search.subtitle": "Search for engineers, architects, contractors and suppliers across Kenya",
  "search.freeModeBanner": "You are browsing as a free user. Login to unlock dashboards, saved requests, and team collaboration.",
  "search.demoContactNotice": "This is a demo profile. Login to contact verified professionals.",
  "hero.searchPlaceholder": "Initiate your query",
  "search.results": "Results",
  "search.viewProfile": "View Profile",
  "search.contact": "Contact",
};

const sonnerToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}));

vi.mock("@/components/landing/Navbar", () => ({
  default: () => <div>Navbar</div>,
}));

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    t: (key: string) => translationMap[key] || key,
  }),
}));

vi.mock("sonner", () => ({
  toast: sonnerToast,
}));

const renderSearch = (initialPath: string) => {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/search" element={<Search />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Free-user search flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })
    );
  });

  it("shows free-mode guidance banner and login link", async () => {
    renderSearch("/search?mode=free");

    expect(await screen.findByText(translationMap["search.freeModeBanner"])).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to Login" })).toHaveAttribute("href", "/login");
  });

  it("opens profile dialog from View Profile action", async () => {
    renderSearch("/search?mode=free");

    fireEvent.click(await screen.findAllByRole("button", { name: "View Profile" }).then((buttons) => buttons[0]));

    expect(await screen.findByText("Professional Profile")).toBeInTheDocument();
    expect(screen.getByText("Profile overview and project highlights.")).toBeInTheDocument();
  });

  it("blocks contact for demo profiles without posting inquiries", async () => {
    const fetchMock = vi.mocked(global.fetch);
    renderSearch("/search?mode=free");

    const beforeClickCalls = fetchMock.mock.calls.length;
    fireEvent.click(await screen.findAllByRole("button", { name: "Contact" }).then((buttons) => buttons[0]));

    expect(sonnerToast.info).toHaveBeenCalledWith(translationMap["search.demoContactNotice"]);
    expect(fetchMock.mock.calls.length).toBe(beforeClickCalls);
  });
});
