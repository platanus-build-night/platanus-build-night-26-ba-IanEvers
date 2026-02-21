import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { TranscriptResult, SpeakerTurn } from "@/app/api/transcribe/route";

const client = new Anthropic();

export interface BigFive {
  openness: number;          // 0-100
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface LanguageProfile {
  overallScore: number;
  vocabularyScore: number;
  grammarScore: number;
}

export interface SpeakerTopic {
  name: string;
  percent: number;      // % of this speaker's turns on this topic
  turnIndices: number[]; // [N] indices from the numbered transcript
}

export interface SpeakerProfile {
  id: number;
  label: string;
  talkTimePercent: number;
  wordCount: number;
  interruptionsGiven: number;
  interruptionsReceived: number;
  bigFive: BigFive;
  language: LanguageProfile;
  fluencyScore: number;
  topics: SpeakerTopic[];
  selfTurnIndices: number[];      // turns where speaker talks about themselves (by theme)
  selfReferencePercent: number;   // derived from selfTurnIndices
  otherReferencePercent: number;  // 100 - selfReferencePercent
  energy: "low" | "medium" | "high";
}

export interface NotablePhrase {
  speakerId: number;
  phrase: string;          // exact substring from transcript
  type: "strong" | "weak"; // strong = impressive word/phrase, weak = grammar/vocab issue
  note: string;            // brief explanation
}

export interface InterruptionEvent {
  giver: number;     // speaker id who interrupted
  receiver: number;  // speaker id who was interrupted
  turnIndex: number; // index in the turns array of the interrupting turn
}

export interface ConversationAnalysis {
  speakers: SpeakerProfile[];
  overallTopics: string[];
  dynamics: string;
  notablePhrases: NotablePhrase[];
  interruptionTurns: InterruptionEvent[];
}

const SCHEMA = `
Schema:
{
  "speakers": [
    {
      "id": 0,
      "label": "Martín",
      "talkTimePercent": 55,
      "wordCount": 342,
      "interruptionsGiven": 3,
      "interruptionsReceived": 1,
      "bigFive": {
        "openness": 85,
        "conscientiousness": 70,
        "extraversion": 60,
        "agreeableness": 45,
        "neuroticism": 30
      },
      "language": {
        "overallScore": 78,
        "vocabularyScore": 85,
        "grammarScore": 71
      },
      "topics": [
        { "name": "seguridad IA", "percent": 45, "turnIndices": [2, 5, 12] },
        { "name": "tendencias industria", "percent": 30, "turnIndices": [7, 18] }
      ],
      "selfTurnIndices": [3, 9, 14],
      "energy": "high"
    }
  ],
  "overallTopics": ["tema1", "tema2"],
  "dynamics": "párrafo de 2-3 oraciones",
  "notablePhrases": [
    { "speakerId": 0, "phrase": "incertidumbre epistemológica", "type": "strong", "note": "Vocabulario filosófico preciso" },
    { "speakerId": 1, "phrase": "fuimos yo y él", "type": "weak", "note": "Debería ser 'él y yo'" }
  ],
  "interruptionTurns": [
    { "giver": 1, "receiver": 0, "turnIndex": 7 }
  ]
}`;

const SYSTEM_PROMPT = `You are a conversation analyst. Analyze a diarized transcript and return ONLY valid JSON.
${SCHEMA}
Speaker labels: try to identify the real name of each speaker from the conversation — someone may be addressed by name, introduce themselves, or be referred to by others. If you can determine a name with reasonable confidence, use it as the label (just the first name). If not, fall back to "Speaker A", "Speaker B", etc.

Big Five guidelines (score 0-100 based on conversational evidence):
- openness: curiosity, creativity, willingness to explore ideas
- conscientiousness: precision, structure, staying on topic
- extraversion: talkativeness, energy, dominance in conversation
- agreeableness: cooperation, avoiding conflict, warmth
- neuroticism: emotional volatility, defensiveness, anxiety signals

Language guidelines:
- vocabularyScore: range and sophistication of words used
- grammarScore: grammatical correctness
- overallScore: average weighted
- notablePhrases: max 8 total. "strong" = rare/precise/eloquent word or phrase. "weak" = clear grammar mistake or awkward phrasing. Use exact substrings from the transcript. IMPORTANT: ignore digits used as spoken words (e.g. "1" instead of "one", "2" instead of "two") — these are speech-to-text transcription artifacts, not speaker errors.

Interruptions: identify turns where a speaker cuts off or takes over mid-sentence from another speaker. The turnIndex refers to the [N] index prefix in the numbered transcript. List each interruption event with the giver (who interrupted), receiver (who was cut off), and turnIndex (the giver's turn number).

Topics per speaker: for each speaker, list up to 4 topics they personally discussed. Each topic: name (2-4 word label IN ENGLISH), percent (must sum to ~100), turnIndices (max 6). Be specific.

selfTurnIndices: for each speaker, list the [N] turn indices where that speaker talks about themselves — their own personal experiences, feelings, opinions, memories, or life. NOT abstract topics or general ideas. Be selective.`;

const SYSTEM_PROMPT_ES = `Eres un analista de conversaciones. Analizá la transcripción diarizada y devolvé SOLO JSON válido.
${SCHEMA}
Nombres de hablantes: intentá identificar el nombre real de cada hablante — alguien puede ser nombrado, presentarse, o ser mencionado por otros. Si podés determinarlo con confianza razonable, usalo como label (solo el primer nombre). Si no, usá "Hablante A", "Hablante B", etc.

Big Five (puntaje 0-100 basado en evidencia conversacional):
- openness: curiosidad, creatividad, disposición a explorar ideas
- conscientiousness: precisión, estructura, mantenerse en tema
- extraversion: locuacidad, energía, dominancia en la conversación
- agreeableness: cooperación, evitar conflictos, calidez
- neuroticism: volatilidad emocional, defensividad, señales de ansiedad

Lenguaje:
- vocabularyScore: rango y sofisticación del vocabulario
- grammarScore: corrección gramatical
- overallScore: promedio ponderado
- notablePhrases: máximo 8 en total. "strong" = palabra o frase precisa/elocuente/inusual. "weak" = error gramatical claro o construcción extraña. Usá substrings exactos de la transcripción. IMPORTANTE: ignorá dígitos usados como palabras habladas (ej: "1" en lugar de "uno", "2" en lugar de "dos") — son artefactos de la transcripción automática, no errores del hablante.

Interrupciones: identificá los turnos donde un hablante corta o toma la palabra mientras otro habla. El turnIndex refiere al índice [N] de la transcripción numerada. Listá cada evento con giver (quien interrumpió), receiver (quien fue cortado) y turnIndex.

Temas por hablante: para cada hablante, listá hasta 4 temas que discutió personalmente. Cada tema: name (etiqueta de 2-4 palabras EN ESPAÑOL), percent (debe sumar ~100), turnIndices (máximo 6). Sé específico.

selfTurnIndices: para cada hablante, listá los índices [N] de los turnos donde ese hablante habla de sí mismo — sus propias experiencias personales, sentimientos, opiniones, recuerdos o vida. NO temas abstractos ni ideas generales. Sé selectivo y preciso.`;


function deriveSelfReference(selfTurnIndices: number[], totalTurns: number): { selfReferencePercent: number; otherReferencePercent: number } {
  if (totalTurns === 0) return { selfReferencePercent: 0, otherReferencePercent: 0 };
  const self = Math.round((selfTurnIndices.length / totalTurns) * 100);
  return { selfReferencePercent: self, otherReferencePercent: 100 - self };
}

const FILLERS = new Set([
  // English
  "um", "uh", "er", "ah", "hmm", "like", "basically", "literally", "actually",
  "right", "so", "well", "okay", "ok",
  // Spanish
  "eh", "este", "bueno", "mmm", "digamos", "pues", "entonces", "igual", "tipo",
  "osea", "o",
]);

function computeFluency(turns: SpeakerTurn[], speakerId: number): number {
  const text = turns.filter((t) => t.speaker === speakerId).map((t) => t.text).join(" ");
  const words = text.toLowerCase().replace(/[^a-záéíóúüñ\s]/gi, "").split(/\s+/).filter(Boolean);
  if (words.length < 15) return 80; // not enough data

  let repeats = 0;
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1] && words[i].length > 1) repeats++;
  }

  let fillerCount = 0;
  for (const w of words) {
    if (FILLERS.has(w)) fillerCount++;
  }

  const ratio = (repeats * 1.5 + fillerCount) / words.length;
  return Math.min(100, Math.max(0, Math.round(100 - ratio * 250)));
}

function computeWordCounts(result: TranscriptResult): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const turn of result.turns) {
    counts[turn.speaker] = (counts[turn.speaker] ?? 0) + turn.text.split(/\s+/).length;
  }
  return counts;
}

function computeTalkTime(result: TranscriptResult): Record<number, number> {
  const time: Record<number, number> = {};
  for (const turn of result.turns) {
    time[turn.speaker] = (time[turn.speaker] ?? 0) + (turn.end - turn.start);
  }
  const total = Object.values(time).reduce((a, b) => a + b, 0);
  const pct: Record<number, number> = {};
  for (const [spk, t] of Object.entries(time)) {
    pct[Number(spk)] = Math.round((t / total) * 100);
  }
  return pct;
}

export async function POST(req: NextRequest) {
  const language = req.headers.get("x-language") ?? "en";
  const transcriptResult: TranscriptResult = await req.json();
  const speakerPrefix = language === "es" ? "Hablante" : "Speaker";
  const transcriptText = transcriptResult.turns
    .map((t, i) => `[${i}] ${speakerPrefix} ${String.fromCharCode(65 + t.speaker)}: ${t.text}`)
    .join("\n");

  const wordCounts = computeWordCounts(transcriptResult);
  const talkTime = computeTalkTime(transcriptResult);

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 5000,
    system: language === "es" ? SYSTEM_PROMPT_ES : SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Transcript:\n${transcriptText}\n\nStats:\n${JSON.stringify({ wordCounts, talkTimePercent: talkTime }, null, 2)}\n\nReturn JSON analysis.`,
    }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return NextResponse.json({ error: "Parse failed" }, { status: 500 });

  const result = JSON.parse(jsonMatch[0]) as ConversationAnalysis;
  const speakerTurnCounts: Record<number, number> = {};
  for (const turn of transcriptResult.turns) {
    speakerTurnCounts[turn.speaker] = (speakerTurnCounts[turn.speaker] ?? 0) + 1;
  }
  for (const spk of result.speakers) {
    spk.fluencyScore = computeFluency(transcriptResult.turns, spk.id);
    spk.selfTurnIndices = spk.selfTurnIndices ?? [];
    const refs = deriveSelfReference(spk.selfTurnIndices, speakerTurnCounts[spk.id] ?? 1);
    spk.selfReferencePercent = refs.selfReferencePercent;
    spk.otherReferencePercent = refs.otherReferencePercent;
  }

  return NextResponse.json(result);
}
