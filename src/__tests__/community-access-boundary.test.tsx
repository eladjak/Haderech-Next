import { render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommunityAccessBoundary } from "@/components/community/community-access-boundary";

const useQueryMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("@/../convex/_generated/api", () => ({
  api: { community: { getAccessStatus: "community:getAccessStatus" } },
}));

describe("CommunityAccessBoundary", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
  });

  it("does not mount community children while access is locked", () => {
    const mounted = vi.fn();
    function QueryingChild() {
      useEffect(() => {
        mounted();
      }, []);
      return <p>private community query surface</p>;
    }
    useQueryMock.mockReturnValue({ canAccess: false, state: "preparing" });

    render(
      <CommunityAccessBoundary>
        <QueryingChild />
      </CommunityAccessBoundary>,
    );

    expect(mounted).not.toHaveBeenCalled();
    expect(screen.queryByText("private community query surface")).toBeNull();
    expect(
      screen.getByRole("heading", {
        name: "הקהילה של אומנות הקשר עדיין בהכנה",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/₪|ש״ח|checkout|רכישה/u)).toBeNull();
  });

  it("mounts community children only after an allowed status", () => {
    useQueryMock.mockReturnValue({ canAccess: true, state: "available" });
    render(
      <CommunityAccessBoundary>
        <p>community child</p>
      </CommunityAccessBoundary>,
    );
    expect(screen.getByText("community child")).toBeInTheDocument();
  });
});
