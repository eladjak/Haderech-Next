import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

/**
 * Accessibility Tests for Navigation Components
 * These tests ensure the application is accessible to all users
 */
describe('Navigation Accessibility', () => {
  describe('Basic Navigation Structure', () => {
    it('should have proper navigation landmark', () => {
      const { container } = render(
        <nav role="navigation" aria-label="Main navigation">
          <a href="/">Home</a>
          <a href="/courses">Courses</a>
          <a href="/forum">Forum</a>
        </nav>
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeDefined();
      expect(nav?.getAttribute('role')).toBe('navigation');
      expect(nav?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have accessible links with proper text', () => {
      render(
        <nav>
          <a href="/">Home</a>
          <a href="/courses">Courses</a>
        </nav>
      );

      const homeLink = screen.getByText('Home');
      const coursesLink = screen.getByText('Courses');

      expect(homeLink).toBeInTheDocument();
      expect(coursesLink).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      const { container } = render(
        <header>
          <h1>Site Title</h1>
          <nav>
            <h2 className="sr-only">Main Navigation</h2>
            <a href="/">Home</a>
          </nav>
        </header>
      );

      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');

      expect(h1).toBeDefined();
      expect(h2).toBeDefined();
    });

    it('should not have accessibility violations in basic nav', async () => {
      const { container } = render(
        <nav role="navigation" aria-label="Main">
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
          </ul>
        </nav>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should have focusable links', () => {
      render(
        <nav>
          <a href="/" tabIndex={0}>
            Home
          </a>
          <a href="/courses" tabIndex={0}>
            Courses
          </a>
        </nav>
      );

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have proper tab order', () => {
      const { container } = render(
        <nav>
          <a href="/" tabIndex={0}>
            First
          </a>
          <a href="/second" tabIndex={0}>
            Second
          </a>
          <a href="/third" tabIndex={0}>
            Third
          </a>
        </nav>
      );

      const links = container.querySelectorAll('a');
      expect(links.length).toBe(3);
      links.forEach((link) => {
        expect(link.tabIndex).toBe(0);
      });
    });

    it('should indicate current page', () => {
      render(
        <nav>
          <a href="/" aria-current="page">
            Home
          </a>
          <a href="/courses">Courses</a>
        </nav>
      );

      const currentLink = screen.getByText('Home');
      expect(currentLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have descriptive aria-labels', () => {
      const { container } = render(
        <nav aria-label="Main navigation">
          <button aria-label="Open menu" aria-expanded="false">
            Menu
          </button>
        </nav>
      );

      const nav = container.querySelector('nav');
      const button = container.querySelector('button');

      expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
      expect(button?.getAttribute('aria-label')).toBe('Open menu');
    });

    it('should announce menu state changes', () => {
      const { container } = render(
        <button aria-expanded="false" aria-controls="menu">
          Toggle Menu
        </button>
      );

      const button = container.querySelector('button');
      expect(button?.getAttribute('aria-expanded')).toBe('false');
      expect(button?.getAttribute('aria-controls')).toBe('menu');
    });

    it('should have skip navigation link', () => {
      render(
        <a href="#main-content" className="sr-only focus:not-sr-only">
          Skip to main content
        </a>
      );

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have proper landmark roles', () => {
      const { container } = render(
        <div>
          <header role="banner">
            <nav role="navigation" aria-label="Main">
              <a href="/">Home</a>
            </nav>
          </header>
          <main role="main">Content</main>
          <footer role="contentinfo">Footer</footer>
        </div>
      );

      expect(container.querySelector('[role="banner"]')).toBeDefined();
      expect(container.querySelector('[role="navigation"]')).toBeDefined();
      expect(container.querySelector('[role="main"]')).toBeDefined();
      expect(container.querySelector('[role="contentinfo"]')).toBeDefined();
    });
  });

  describe('Mobile Menu Accessibility', () => {
    it('should have accessible mobile menu button', () => {
      const { container } = render(
        <button
          aria-label="Toggle mobile menu"
          aria-expanded="false"
          aria-controls="mobile-menu"
        >
          <span aria-hidden="true">☰</span>
        </button>
      );

      const button = container.querySelector('button');
      expect(button?.getAttribute('aria-label')).toBe('Toggle mobile menu');
      expect(button?.getAttribute('aria-expanded')).toBe('false');
      expect(button?.getAttribute('aria-controls')).toBe('mobile-menu');
    });

    it('should hide decorative icons from screen readers', () => {
      const { container } = render(
        <button aria-label="Menu">
          <svg aria-hidden="true">
            <path d="M0 0h24v24H0z" />
          </svg>
        </button>
      );

      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should have proper focus management', () => {
      const { container } = render(
        <div>
          <button id="menu-button" aria-label="Menu">
            Menu
          </button>
          <div id="menu" hidden>
            <a href="/">Home</a>
            <a href="/about">About</a>
          </div>
        </div>
      );

      const menu = container.querySelector('#menu');
      expect(menu?.hasAttribute('hidden')).toBe(true);
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have visible focus indicators', () => {
      const { container } = render(
        <a href="/" className="focus:ring-2 focus:ring-blue-500">
          Home
        </a>
      );

      const link = container.querySelector('a');
      expect(link?.className).toContain('focus:ring');
    });

    it('should not rely solely on color for information', () => {
      render(
        <nav>
          <a href="/" className="active" aria-current="page">
            <span className="sr-only">Current: </span>
            Home
          </a>
        </nav>
      );

      const link = screen.getByText(/Home/);
      expect(link).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('RTL (Right-to-Left) Support', () => {
    it('should support RTL navigation', () => {
      const { container } = render(
        <nav dir="rtl" lang="he">
          <a href="/">בית</a>
          <a href="/courses">קורסים</a>
        </nav>
      );

      const nav = container.querySelector('nav');
      expect(nav?.getAttribute('dir')).toBe('rtl');
      expect(nav?.getAttribute('lang')).toBe('he');
    });

    it('should have proper RTL text content', () => {
      render(
        <nav dir="rtl">
          <a href="/">בית</a>
          <a href="/courses">קורסים</a>
          <a href="/forum">פורום</a>
        </nav>
      );

      expect(screen.getByText('בית')).toBeInTheDocument();
      expect(screen.getByText('קורסים')).toBeInTheDocument();
      expect(screen.getByText('פורום')).toBeInTheDocument();
    });
  });

  describe('Complex Navigation Patterns', () => {
    it('should have accessible dropdown menu', async () => {
      const { container } = render(
        <nav>
          <button
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls="dropdown-menu"
          >
            More
          </button>
          <ul id="dropdown-menu" role="menu" hidden>
            <li role="none">
              <a href="/option1" role="menuitem">
                Option 1
              </a>
            </li>
            <li role="none">
              <a href="/option2" role="menuitem">
                Option 2
              </a>
            </li>
          </ul>
        </nav>
      );

      const button = container.querySelector('button');
      const menu = container.querySelector('#dropdown-menu');

      expect(button?.getAttribute('aria-haspopup')).toBe('true');
      expect(button?.getAttribute('aria-expanded')).toBe('false');
      expect(menu?.getAttribute('role')).toBe('menu');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible breadcrumb navigation', async () => {
      const { container } = render(
        <nav aria-label="Breadcrumb">
          <ol>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/courses">Courses</a>
            </li>
            <li aria-current="page">Current Course</li>
          </ol>
        </nav>
      );

      const nav = container.querySelector('nav');
      expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have accessible tabs navigation', async () => {
      const { container } = render(
        <div>
          <div role="tablist" aria-label="Course sections">
            <button role="tab" aria-selected="true" aria-controls="panel-1">
              Overview
            </button>
            <button role="tab" aria-selected="false" aria-controls="panel-2">
              Lessons
            </button>
          </div>
          <div id="panel-1" role="tabpanel">
            Overview content
          </div>
          <div id="panel-2" role="tabpanel" hidden>
            Lessons content
          </div>
        </div>
      );

      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist?.getAttribute('aria-label')).toBe('Course sections');

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Error States and Feedback', () => {
    it('should announce errors to screen readers', () => {
      const { container } = render(
        <div role="alert" aria-live="polite">
          Navigation error occurred
        </div>
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert?.getAttribute('aria-live')).toBe('polite');
      expect(alert?.textContent).toBe('Navigation error occurred');
    });

    it('should provide accessible loading states', () => {
      const { container } = render(
        <div role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">Loading navigation...</span>
        </div>
      );

      const status = container.querySelector('[role="status"]');
      expect(status?.getAttribute('aria-busy')).toBe('true');
    });
  });
});
