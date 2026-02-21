"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { SlidesState } from "@/app/api/slides/route";
import VoiceInput from "@/components/VoiceInput";

const SlidesView = dynamic(() => import("@/components/SlidesView"), { ssr: false });

const EMPTY_STATE: SlidesState = { deckTitle: "", slides: [] };
const DEBOUNCE_MS = 2500;
const MIN_NEW_WORDS = 6;

const SLIDES_DEMO = `Bienvenidos a todos. Hoy quiero hablar sobre cómo la inteligencia artificial está transformando el mundo tal como lo conocemos.

Empecemos por dónde estamos hoy. La IA ya está en todos lados — en tu teléfono, tu auto, los hospitales. El año pasado, las empresas de IA recaudaron más de cien mil millones de dólares en financiamiento a nivel global.

El gran avance han sido los modelos de lenguaje. Estos sistemas están entrenados con miles de millones de documentos y pueden entender, razonar y generar lenguaje humano a un nivel extraordinario. Empresas como Anthropic, OpenAI y Google lideran esta carrera.

Hablemos ahora de qué significa esto para el trabajo. Algunos empleos van a cambiar, pero la historia muestra que la tecnología siempre crea más oportunidades de las que elimina. La clave es adaptarse. Las personas que aprendan a trabajar con IA van a ser mucho más productivas que las que no lo hagan.

¿Qué podés hacer hoy? Empezá a experimentar con herramientas de IA en tu trabajo diario. Mantené la curiosidad. Y recordá — las empresas que van a ganar la próxima década son las que abracen esta tecnología ahora, no después.

Muchas gracias.`;

export default function SlidesBuilder() {
  const [slidesState, setSlidesState] = useState<SlidesState>(EMPTY_STATE);
  const [status, setStatus] = useState<"idle" | "listening" | "updating" | "done">("idle");
  const [testMode, setTestMode] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessedTranscript = useRef("");
  const currentStateRef = useRef<SlidesState>(EMPTY_STATE);
  const isCallingRef = useRef(false);

  useEffect(() => { currentStateRef.current = slidesState; }, [slidesState]);

  const callApi = useCallback(async (transcript: string) => {
    if (isCallingRef.current) return;
    isCallingRef.current = true;
    setStatus("updating");
    setError(null);

    try {
      const res = await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, currentState: currentStateRef.current }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (!data.noChange) setSlidesState(data as SlidesState);
      lastProcessedTranscript.current = transcript;
      setStatus("done");
    } catch {
      setError("Something went wrong.");
      setStatus("idle");
    } finally {
      isCallingRef.current = false;
    }
  }, []);

  const handleTranscriptUpdate = useCallback(
    (fullTranscript: string) => {
      setStatus("listening");
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const prevWords = lastProcessedTranscript.current.trim().split(/\s+/).filter(Boolean).length;
        const newWords = fullTranscript.trim().split(/\s+/).filter(Boolean).length;
        if (newWords - prevWords >= MIN_NEW_WORDS) {
          callApi(fullTranscript);
        } else {
          setStatus("idle");
        }
      }, DEBOUNCE_MS);
    },
    [callApi]
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <aside className="w-80 flex-shrink-0 p-4 flex flex-col gap-4 border-r border-white/60 bg-white/30 backdrop-blur overflow-y-auto">
        <VoiceInput
          onTranscriptUpdate={handleTranscriptUpdate}
          status={status}
          testMode={testMode}
          onToggleTestMode={() => setTestMode((m) => !m)}
          demoText={SLIDES_DEMO}
          demoLabel="✨ Demo: IA y el futuro"
          inputLabel="Tu presentación"
          placeholder="Empezá a hablar — las slides se construyen solas..."
        />
        {error && (
          <div className="px-3 py-2 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">{error}</div>
        )}
        {slidesState.slides.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-2">Presentación</p>
            <p className="font-semibold text-gray-800 text-sm">{slidesState.deckTitle}</p>
            <p className="text-xs text-gray-500 mt-1">{slidesState.slides.length} slides</p>
          </div>
        )}
      </aside>

      {/* Slides panel */}
      <main className="flex-1 overflow-hidden relative">
        {status === "updating" && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-amber-600">Generando slides...</span>
          </div>
        )}
        <SlidesView state={slidesState} />
        {slidesState.slides.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
            <span className="text-5xl mb-4">🎞</span>
            <p className="text-gray-500 text-lg font-medium">Comenzá tu presentación</p>
            <p className="text-gray-400 text-sm mt-1">
              {testMode ? 'Presioná "Demo" o escribí tu propia charla.' : "Empezá a hablar y los slides aparecen solos."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
