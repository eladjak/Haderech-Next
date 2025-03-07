"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ForumFiltersProps {
  onSearch: (query: string) => void;
  onFilterByTag?: (tag: string) => void;
  onFilterByCategory?: (category: string) => void;
  onClearFilters?: () => void;
  tags?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
  selectedTags?: string[];
  selectedCategories?: string[];
}

export function ForumFilters({
  onSearch,
  onFilterByTag,
  onFilterByCategory,
  onClearFilters,
  tags = [],
  categories = [],
  selectedTags = [],
  selectedCategories = [],
}: ForumFiltersProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="space-y-4 rounded-lg border bg-background p-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="חיפוש בפורום..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">חפש</Button>
      </form>

      {(tags.length > 0 || categories.length > 0) && (
        <div className="space-y-3">
          {tags.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">תגיות</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={
                      selectedTags.includes(tag.id) ? "default" : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => onFilterByTag && onFilterByTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">קטגוריות</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={
                      selectedCategories.includes(category.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      onFilterByCategory && onFilterByCategory(category.id)
                    }
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(selectedTags.length > 0 || selectedCategories.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="mt-2"
            >
              נקה סינון
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
