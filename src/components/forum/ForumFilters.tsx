"use client";

// React and external dependencies
import React, { useCallback, useEffect, useState } from "react";

import { Filter, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Utils
import { cn } from "@/lib/utils";
// Types
import type { ForumFilters as ForumFiltersType } from "@/types/forum";

export interface ForumFiltersProps {
  onFilter?: (filters: ForumFiltersType) => void;
  className?: string;
  filters?: ForumFiltersType;
}

export function ForumFilters({
  onFilter,
  className,
  filters = {
    search: "",
    sort: "latest",
    category: undefined,
    status: "all",
    timeframe: "all",
  },
}: ForumFiltersProps): React.ReactElement {
  const [search, setSearch] = useState(filters.search);
  const [sort, setSort] = useState<ForumFiltersType["sort"]>(filters.sort);
  const [category, setCategory] = useState(filters.category || "");
  const [status, setStatus] = useState<ForumFiltersType["status"]>(
    filters.status
  );
  const [timeframe, setTimeframe] = useState<ForumFiltersType["timeframe"]>(
    filters.timeframe
  );

  const handleFilterChange = useCallback(
    (key: keyof ForumFiltersType, value: string) => {
      if (onFilter) {
        onFilter({
          ...filters,
          [key]: value,
        });
      }
    },
    [onFilter, filters]
  );

  useEffect(() => {
    handleFilterChange("search", search);
    handleFilterChange("sort", sort);
    handleFilterChange("category", category);
    handleFilterChange("status", status);
    handleFilterChange("timeframe", timeframe);
  }, [search, sort, category, status, timeframe, handleFilterChange]);

  const handleReset = () => {
    setSearch("");
    setSort("latest");
    setCategory("");
    setStatus("all");
    setTimeframe("all");
  };

  return (
    <div
      className={cn("flex items-center space-x-4", className)}
      role="search"
      aria-label="סינון פוסטים בפורום"
    >
      <div className="relative">
        <Search
          className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="w-full">
          <Input
            placeholder="חיפוש בפורום..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="חיפוש בפורום"
            data-testid="search-input"
          />
        </div>
      </div>
      <Select
        value={sort}
        onValueChange={(value) => {
          setSort(value as ForumFiltersType["sort"]);
        }}
        data-testid="sort-select"
      >
        <SelectTrigger
          className="w-[180px]"
          data-testid="sort-trigger"
          aria-label="מיין תוצאות"
        >
          <SelectValue>
            {sort === "latest"
              ? "הכי חדשים"
              : sort === "popular"
                ? "הכי פופולריים"
                : "ללא מענה"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest" data-testid="sort-option-latest">
            הכי חדשים
          </SelectItem>
          <SelectItem value="popular" data-testid="sort-option-popular">
            הכי פופולריים
          </SelectItem>
          <SelectItem value="unanswered" data-testid="sort-option-unanswered">
            ללא מענה
          </SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value as ForumFiltersType["status"]);
        }}
        data-testid="status-select"
      >
        <SelectTrigger
          className="w-[180px]"
          data-testid="status-trigger"
          aria-label="סנן לפי סטטוס"
        >
          <SelectValue>
            {status === "all"
              ? "כל הסטטוסים"
              : status === "solved"
                ? "נפתר"
                : "לא נפתר"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" data-testid="status-option-all">
            כל הסטטוסים
          </SelectItem>
          <SelectItem value="solved" data-testid="status-option-solved">
            נפתר
          </SelectItem>
          <SelectItem value="unsolved" data-testid="status-option-unsolved">
            לא נפתר
          </SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={timeframe}
        onValueChange={(value) => {
          setTimeframe(value as ForumFiltersType["timeframe"]);
        }}
        data-testid="timeframe-select"
      >
        <SelectTrigger
          className="w-[180px]"
          data-testid="timeframe-trigger"
          aria-label="סנן לפי טווח זמן"
        >
          <SelectValue>
            {timeframe === "all"
              ? "כל הזמנים"
              : timeframe === "today"
                ? "היום"
                : timeframe === "week"
                  ? "השבוע"
                  : timeframe === "month"
                    ? "החודש"
                    : "השנה"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" data-testid="timeframe-option-all">
            כל הזמנים
          </SelectItem>
          <SelectItem value="today" data-testid="timeframe-option-today">
            היום
          </SelectItem>
          <SelectItem value="week" data-testid="timeframe-option-week">
            השבוע
          </SelectItem>
          <SelectItem value="month" data-testid="timeframe-option-month">
            החודש
          </SelectItem>
          <SelectItem value="year" data-testid="timeframe-option-year">
            השנה
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        onClick={handleReset}
        data-testid="reset-filters"
        aria-label="אפס את כל הפילטרים"
      >
        אפס פילטרים
      </Button>
    </div>
  );
}
