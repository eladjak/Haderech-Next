import {
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import { cleanup, fireEvent, render, screen, waitFor} from "@/components/ui/";
import type { UseThemeProps } from "next-themes/dist/types";
import {

"use client";

 cleanup, fireEvent, render, screen,
export {}

  cleanup,
  fireEvent,
  render,
  screen,
  waitFor} from "@testing-library/react";















// Mock next-themes
vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  )}));

// Mock the theme hook implementation
const mockSetTheme = vi.fn();
let mockTheme = "light";

vi.mocked(useTheme).mockImplementation(
  () =>
    ({
      theme: mockTheme,
      setTheme: mockSetTheme,
      themes: ["light", "dark", "system"],
      systemTheme: "light",
      resolvedTheme: mockTheme,
      forcedTheme: mockTheme}) as UseThemeProps
);

// Mock Radix UI components
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-toggle-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild}: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="theme-toggle-trigger">{children}</div>,
  DropdownMenuContent: ({
    children,
    align}: {
    children: React.ReactNode;
    align?: string;
  }) => (
    <div
      role="menu"
      data-testid="theme-toggle-content"
      aria-label="אפשרויות ערכת נושא"
    >
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    onClick}: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <div
      role="menuitem"
      data-testid="theme-toggle-item"
      onClick={onClick}
      tabIndex={0}
    >
      {children}
    </div>
  )}));

// Mock Button component
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    size,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
  }) => (
    <button
      data-testid="theme-toggle-button"
      aria-haspopup="menu"
      aria-label="החלף ערכת נושא"
      {...props}
    >
      {children}
    </button>
  )}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockTheme = "light";
    mockSetTheme.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  const renderThemeToggle = () => {
    return render(
      <ThemeProvider attribute="class">
        <ThemeToggle />
      </ThemeProvider>
    );
  }

  it("מציג את כפתור החלפת ערכת הנושא", () => {
    renderThemeToggle();
    const button = screen.getByRole("button", { name: "החלף ערכת נושא" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "החלף ערכת נושא");
  });

  it("מציג את אפשרויות ערכות הנושא", () => {
    renderThemeToggle();
    const button = screen.getByRole("button", { name: "החלף ערכת נושא" });
    fireEvent.click(button);

    const menuItems = screen.getAllByRole("menuitem");
    const itemTexts = menuItems.map((item) => item.textContent);
    expect(itemTexts).toContain("בהיר");
    expect(itemTexts).toContain("כהה");
    expect(itemTexts).toContain("מערכת");
  });

  it("מפעיל את setTheme עם הערך המתאים בלחיצה על אפשרות", () => {
    renderThemeToggle();
    const button = screen.getByRole("button", { name: "החלף ערכת נושא" });
    fireEvent.click(button);

    const menuItems = screen.getAllByRole("menuitem");
    const darkThemeButton = menuItems.find(
      (item) => item.textContent === "כהה"
    );
    fireEvent.click(darkThemeButton!);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("מציג את האייקון המתאים בהתאם לערכת הנושא הנוכחית", () => {
    // בודק מצב בהיר
    mockTheme = "light";
    const { container: lightContainer } = renderThemeToggle();
    const lightIcon = lightContainer.querySelector(".lucide-sun");
    expect(lightIcon).toBeInTheDocument();

    cleanup();

    // בודק מצב כהה
    mockTheme = "dark";
    const { container: darkContainer } = renderThemeToggle();
    const moonIcon = darkContainer.querySelector(".lucide-moon");
    expect(moonIcon).toBeInTheDocument();
  });

  it("שומר על ערכת הנושא הנוכחית בעת טעינה מחדש", () => {
    mockTheme = "dark";
    renderThemeToggle();
    expect(mockTheme).toBe("dark");

    const button = screen.getByRole("button", { name: "החלף ערכת נושא" });
    fireEvent.click(button);

    const menuItems = screen.getAllByRole("menuitem");
    const lightThemeButton = menuItems.find(
      (item) => item.textContent === "בהיר"
    );
    fireEvent.click(lightThemeButton!);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("מטפל בשגיאות בעת החלפת ערכת נושא", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // מדמה שגיאה בעת החלפת ערכת נושא
    mockSetTheme.mockImplementationOnce(() => {
      throw new Error("שגיאה בהחלפת ערכת נושא");
    });

    renderThemeToggle();
    const button = screen.getByRole("button", { name: "החלף ערכת נושא" });
    fireEvent.click(button);

    const menuItems = screen.getAllByRole("menuitem");
    const darkThemeButton = menuItems.find(
      (item) => item.textContent === "כהה"
    );
    fireEvent.click(darkThemeButton!);

    // מוודא שהשגיאה נתפסה ונרשמה
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "שגיאה בהחלפת ערכת נושא:",
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
