"use client";

import { useState } from "react";
import { SlidesState, Slide } from "@/app/api/slides/route";

interface SlidesViewProps {
  state: SlidesState;
}

function SlideCard({ slide, index, total }: { slide: Slide; index: number; total: number }) {
  const isTitleSlide = slide.layout === "title";
  const isQuote = slide.layout === "quote";

  return (
    <div
      className="w-full h-full flex flex-col rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: `linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)` }}
    >
      {/* Accent bar */}
      <div className="h-1.5 w-full flex-shrink-0" style={{ background: slide.accent }} />

      <div
        className={`flex-1 flex flex-col px-12 py-10 ${
          isTitleSlide || isQuote ? "items-center justify-center text-center" : "justify-center"
        }`}
      >
        {isTitleSlide ? (
          <>
            <p className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: slide.accent }}>
              Presentación
            </p>
            <h1 className="text-5xl font-bold text-white leading-tight">{slide.title}</h1>
          </>
        ) : isQuote ? (
          <>
            <div className="text-6xl mb-6 opacity-30" style={{ color: slide.accent }}>"</div>
            <p className="text-3xl font-semibold text-white leading-snug max-w-2xl">{slide.title}</p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-1 rounded-full" style={{ background: slide.accent }} />
              <h2 className="text-3xl font-bold text-white">{slide.title}</h2>
            </div>
            <ul className="flex flex-col gap-4">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ background: slide.accent }}
                  />
                  <span className="text-gray-200 text-xl leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Slide counter */}
      <div className="px-10 py-4 flex justify-between items-center flex-shrink-0">
        <span className="text-gray-600 text-xs">{slide.id}</span>
        <span className="text-gray-600 text-xs">
          {index + 1} / {total}
        </span>
      </div>
    </div>
  );
}

export default function SlidesView({ state }: SlidesViewProps) {
  const [current, setCurrent] = useState(0);

  if (state.slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Los slides aparecerán acá mientras hablás
      </div>
    );
  }

  const slide = state.slides[Math.min(current, state.slides.length - 1)];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Main slide */}
      <div className="flex-1 min-h-0">
        <SlideCard slide={slide} index={current} total={state.slides.length} />
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 flex-shrink-0">
        {state.slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={`flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              i === current ? "border-indigo-400 scale-105" : "border-transparent opacity-60 hover:opacity-90"
            }`}
            style={{ background: `linear-gradient(135deg, #0f0f1a, #1a1a2e)` }}
          >
            <div className="h-0.5 w-full" style={{ background: s.accent }} />
            <div className="p-1.5">
              <p className="text-white text-xs font-semibold truncate leading-tight">{s.title}</p>
              {s.bullets[0] && (
                <p className="text-gray-500 text-xs truncate mt-0.5">{s.bullets[0]}</p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Arrow nav */}
      <div className="flex justify-center gap-3 flex-shrink-0">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="px-4 py-2 rounded-xl bg-white shadow text-sm font-medium text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors"
        >
          ← Anterior
        </button>
        <button
          onClick={() => setCurrent((c) => Math.min(state.slides.length - 1, c + 1))}
          disabled={current === state.slides.length - 1}
          className="px-4 py-2 rounded-xl bg-white shadow text-sm font-medium text-gray-600 disabled:opacity-30 hover:bg-gray-50 transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
