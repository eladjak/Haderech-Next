"use client";

import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const [language, setLanguage] = useState("he");

  useEffect(() => {
    // שמירת השפה הנבחרת ב-localStorage
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className={className}>
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-[120px]">
          <Globe className="mr-2 h-4 w-4" />
          <SelectValue placeholder="שפה" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="he">עברית</SelectItem>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="ar">العربية</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
