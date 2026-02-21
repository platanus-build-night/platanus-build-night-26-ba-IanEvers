"use client";

import { useState, useRef, useEffect } from "react";

interface VoiceInputProps {
  onTranscriptUpdate: (fullTranscript: string) => void;
  status: "idle" | "listening" | "updating" | "done";
  testMode: boolean;
  onToggleTestMode: () => void;
  demoText?: string;
  demoLabel?: string;
  inputLabel?: string;
  placeholder?: string;
}

const DEFAULT_DEMO = `Elena Cruz is a brilliant scientist with curly brown hair and round glasses. She has dedicated her life to finding a cure for a rare disease.
Marco is Elena's research partner and closest friend, a tall man with messy dark hair and a warm smile. He is secretly in love with her.
Dr. Hargrove is Elena's stern mentor, an older man with slicked white hair and cold grey eyes. He is ruthless and calculating.
One day Elena discovers that Hargrove has been falsifying research data for years. She confronts him, but Hargrove threatens to destroy her career if she speaks out.
Marco stands by Elena despite the risks. Together they decide to expose the truth.
Sofia is a journalist with short red hair and sharp green eyes who has been investigating Hargrove independently. Sofia and Elena form an unlikely alliance.
Marco is uncomfortable with Sofia's aggressive methods and they argue constantly. But Sofia is determined.
Viktor is Hargrove's intimidating assistant, a tall man with a shaved head and a jagged scar across his left cheek. Hargrove sends Viktor to warn Elena to stop digging.
But Elena refuses to back down. She confronts Hargrove one final time with Marco and Sofia at her side.`;

function splitIntoChunks(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function VoiceInput({
  onTranscriptUpdate,
  status,
  testMode,
  onToggleTestMode,
  demoText = DEFAULT_DEMO,
  demoLabel = "✨ Run Demo Story",
  inputLabel = "Your story",
  placeholder = "Type here — auto-updates on pause...",
}: VoiceInputProps) {
  const [transcript, setTranscript] = useState("");
  const [simulateText, setSimulateText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSimulatingRef = useRef(false);

  useEffect(() => { isSimulatingRef.current = isSimulating; }, [isSimulating]);

  useEffect(() => {
    if (typeof window === "undefined" || testMode) return;
    const SpeechRecognition =
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof window.SpeechRecognition }).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "es-AR";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript + " ";
      }
      const updated = full.trim();
      setTranscript(updated);
      onTranscriptUpdate(updated);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [testMode, onTranscriptUpdate]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const runSimulation = async (story: string) => {
    setIsSimulating(true);
    isSimulatingRef.current = true;
    setTranscript("");

    const chunks = splitIntoChunks(story);
    let accumulated = "";

    for (const chunk of chunks) {
      if (!isSimulatingRef.current) break;
      const words = chunk.split(/\s+/);
      for (const word of words) {
        if (!isSimulatingRef.current) break;
        accumulated += (accumulated ? " " : "") + word;
        setTranscript(accumulated);
        onTranscriptUpdate(accumulated);
        await delay(100);
      }
      await delay(3200);
    }

    setIsSimulating(false);
    isSimulatingRef.current = false;
  };

  const stopSimulate = () => {
    isSimulatingRef.current = false;
    setIsSimulating(false);
  };

  const statusLabel = {
    idle: "Esperando...",
    listening: "Escuchando...",
    updating: "Actualizando...",
    done: "Al día ✓",
  }[status];

  const statusColor = {
    idle: "text-gray-400",
    listening: "text-indigo-500 animate-pulse",
    updating: "text-amber-500 animate-pulse",
    done: "text-green-500",
  }[status];

  return (
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-2 bg-white rounded-2xl shadow px-4 py-3">
        <span className="text-sm text-gray-500 flex-1">Modo</span>
        <button
          onClick={() => !testMode || onToggleTestMode()}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            !testMode ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          🎙 Voz
        </button>
        <button
          onClick={() => testMode || onToggleTestMode()}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            testMode ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          ⌨️ Test
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-3">
        {testMode ? (
          <>
            <button
              onClick={() => { setSimulateText(demoText); runSimulation(demoText); }}
              disabled={isSimulating}
              className="w-full px-4 py-2 rounded-xl bg-violet-600 text-white font-semibold text-sm hover:bg-violet-700 disabled:opacity-40 transition-colors"
            >
              {demoLabel}
            </button>

            <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">O pegá el tuyo</p>
              <textarea
                value={simulateText}
                onChange={(e) => setSimulateText(e.target.value)}
                rows={4}
                placeholder="Pegá texto acá (un párrafo por línea)..."
                className="w-full p-3 rounded-xl border border-gray-200 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={() => isSimulating ? stopSimulate() : runSimulation(simulateText)}
                disabled={!simulateText.trim() && !isSimulating}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isSimulating
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-700"
                }`}
              >
                {isSimulating ? "⏹ Detener" : "▶ Simular habla"}
              </button>
            </div>

            <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{inputLabel}</p>
              <textarea
                onChange={(e) => {
                  if (isSimulating) return;
                  setTranscript(e.target.value);
                  onTranscriptUpdate(e.target.value);
                }}
                value={isSimulating ? transcript : undefined}
                defaultValue=""
                rows={3}
                placeholder={placeholder}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Transcript</p>
            <div className="min-h-[80px] max-h-48 overflow-y-auto p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm leading-relaxed">
              {transcript || <span className="text-gray-400">Empezá a hablar...</span>}
            </div>
            <button
              onClick={toggleListening}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {isListening ? "⏹ Detener" : "🎙 Empezar a escuchar"}
            </button>
          </>
        )}
      </div>

      <div className="px-1">
        <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
      </div>
    </div>
  );
}
