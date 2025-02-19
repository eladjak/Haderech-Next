"use client";

import * as React from "react";

import Link from "next/link";

import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  segments: {
    title: string;
    href: string;
  }[];
  separator?: React.ReactNode;
}

const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ segments, separator, className, ...props }, ref) => {
    const defaultSeparator = <ChevronLeft className="mx-2 h-4 w-4" />;

    return (
      <nav
        ref={ref}
        aria-label="breadcrumbs"
        className={cn(
          "flex items-center text-sm text-muted-foreground",
          className
        )}
        {...props}
      >
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;

          return (
            <React.Fragment key={segment.href}>
              <Link
                href={segment.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  isLast && "pointer-events-none font-medium text-foreground"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {segment.title}
              </Link>
              {!isLast && (separator || defaultSeparator)}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }
);
Breadcrumbs.displayName = "Breadcrumbs";

export { Breadcrumbs };
