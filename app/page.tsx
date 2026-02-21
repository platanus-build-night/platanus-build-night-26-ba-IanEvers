"use client";

import ConversationAnalyzer from "@/components/ConversationAnalyzer";

function CharlitaLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bubbleGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#57534e" />
          <stop offset="100%" stopColor="#292524" />
        </linearGradient>
        <linearGradient id="bubbleGrad2" x1="10" y1="14" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
      </defs>
      {/* First bubble (charcoal, top-left) */}
      <rect x="1" y="1" width="20" height="14" rx="4" fill="url(#bubbleGrad)" />
      <path d="M5 15 L5 20 L10 15 Z" fill="url(#bubbleGrad)" />
      {/* Waveform bars */}
      <rect x="5"  y="6.5" width="2" height="3"   rx="1" fill="white" opacity="0.8" />
      <rect x="9"  y="4.5" width="2" height="7"   rx="1" fill="white" opacity="0.8" />
      <rect x="13" y="5.5" width="2" height="5"   rx="1" fill="white" opacity="0.8" />
      <rect x="17" y="6"   width="2" height="4"   rx="1" fill="white" opacity="0.8" />
      {/* Second bubble (terracotta, bottom-right) */}
      <rect x="11" y="17" width="20" height="14" rx="4" fill="url(#bubbleGrad2)" />
      <path d="M27 31 L27 26 L22 31 Z" fill="url(#bubbleGrad2)" />
      {/* Waveform bars */}
      <rect x="15" y="22.5" width="2" height="3"   rx="1" fill="white" opacity="0.8" />
      <rect x="19" y="20.5" width="2" height="7"   rx="1" fill="white" opacity="0.8" />
      <rect x="23" y="21.5" width="2" height="5"   rx="1" fill="white" opacity="0.8" />
      <rect x="27" y="22"   width="2" height="4"   rx="1" fill="white" opacity="0.8" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="px-6 py-3 flex items-center border-b border-stone-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <CharlitaLogo />
          <span className="font-bold text-stone-900 text-lg tracking-tight">Charlita</span>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <ConversationAnalyzer />
      </div>
    </div>
  );
}
