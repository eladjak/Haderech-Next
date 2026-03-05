"use client";

import { useState, useCallback } from "react";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // User cancelled
      }
    } else {
      setShowMenu((prev) => !prev);
    }
  }, [title, text, shareUrl]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  }, [shareUrl]);

  // Social share URLs
  const shareLinks = [
    { name: "WhatsApp", icon: "\u{1F4AC}", url: `https://wa.me/?text=${encodeURIComponent(title + " " + shareUrl)}` },
    { name: "Facebook", icon: "\u{1F4D8}", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: "Twitter", icon: "\u{1F426}", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}` },
    { name: "Telegram", icon: "\u2708\uFE0F", url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}` },
  ];

  return (
    <div className={`relative ${className ?? ""}`}>
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-lg border border-brand-200 px-3 py-2 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-zinc-900"
        aria-label="\u05E9\u05EA\u05E3"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {"\u05E9\u05EA\u05E3"}
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 z-50 mt-2 w-48 rounded-xl border border-brand-100/30 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-blue-500 transition-colors hover:bg-brand-50 dark:text-white dark:hover:bg-zinc-800"
              onClick={() => setShowMenu(false)}
            >
              <span>{link.icon}</span>
              {link.name}
            </a>
          ))}
          <button
            onClick={copyToClipboard}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-blue-500 transition-colors hover:bg-brand-50 dark:text-white dark:hover:bg-zinc-800"
          >
            <span>{copied ? "\u2705" : "\u{1F4CB}"}</span>
            {copied ? "\u05D4\u05D5\u05E2\u05EA\u05E7!" : "\u05D4\u05E2\u05EA\u05E7 \u05E7\u05D9\u05E9\u05D5\u05E8"}
          </button>
        </div>
      )}
    </div>
  );
}
