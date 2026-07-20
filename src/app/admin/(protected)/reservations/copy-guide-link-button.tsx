"use client";

import { useState } from "react";

export function CopyGuideLinkButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="whitespace-nowrap rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
    >
      {copied ? "복사됨!" : "가이드 링크 복사"}
    </button>
  );
}
