"use client";

import ConversationAnalyzer from "@/components/ConversationAnalyzer";

function CharlitaLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bubbleGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="bubbleGrad2" x1="10" y1="14" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* First bubble (indigo, top-left) */}
      <rect x="1" y="1" width="20" height="14" rx="4" fill="url(#bubbleGrad)" />
      <path d="M5 15 L5 20 L10 15 Z" fill="url(#bubbleGrad)" />
      {/* Waveform bars */}
      <rect x="5"  y="6.5" width="2" height="3"   rx="1" fill="white" opacity="0.85" />
      <rect x="9"  y="4.5" width="2" height="7"   rx="1" fill="white" opacity="0.85" />
      <rect x="13" y="5.5" width="2" height="5"   rx="1" fill="white" opacity="0.85" />
      <rect x="17" y="6"   width="2" height="4"   rx="1" fill="white" opacity="0.85" />
      {/* Second bubble (pink, bottom-right) */}
      <rect x="11" y="17" width="20" height="14" rx="4" fill="url(#bubbleGrad2)" />
      <path d="M27 31 L27 26 L22 31 Z" fill="url(#bubbleGrad2)" />
      {/* Waveform bars */}
      <rect x="15" y="22.5" width="2" height="3"   rx="1" fill="white" opacity="0.85" />
      <rect x="19" y="20.5" width="2" height="7"   rx="1" fill="white" opacity="0.85" />
      <rect x="23" y="21.5" width="2" height="5"   rx="1" fill="white" opacity="0.85" />
      <rect x="27" y="22"   width="2" height="4"   rx="1" fill="white" opacity="0.85" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col">
      <header className="px-6 py-3 flex items-center border-b border-white/60 bg-white/50 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <CharlitaLogo />
          <span className="font-bold text-gray-800 text-lg">Charlita</span>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <ConversationAnalyzer />
      </div>
    </div>
  );
}
