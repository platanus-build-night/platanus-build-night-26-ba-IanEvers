import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export interface Slide {
  id: string;
  layout: "title" | "content" | "quote";
  title: string;
  bullets: string[];
  accent: string;
}

export interface SlidesState {
  deckTitle: string;
  slides: Slide[];
}

const ACCENTS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#14b8a6"];

const SYSTEM_PROMPT = `You are a real-time presentation builder. Given a spoken transcript, extract a slide deck.

Decide if the transcript has enough new content to update the slide deck. If YES return Schema A. If NO return {"noChange": true}.

Schema A:
{
  "deckTitle": "string",
  "slides": [
    {
      "id": "slide_1",
      "layout": "title" | "content" | "quote",
      "title": "string",
      "bullets": ["string"],
      "accent": "${ACCENTS[0]}"
    }
  ]
}

Rules:
- layout "title": opening/closing slide, large centered text, no bullets
- layout "content": regular slide with title + 2-4 bullet points (concise, punchy)
- layout "quote": a strong statement or key number, title is the quote, no bullets
- Keep bullet points SHORT — max 8 words each
- Pick accent color from: ${ACCENTS.join(", ")}
- First slide should always be layout "title"
- Keep slide ids stable across updates (slide_1, slide_2, etc.)
- Add new slides as the talk progresses, update existing ones if needed
- Output ONLY valid JSON, no extra text`;

export async function POST(req: NextRequest) {
  const { transcript, currentState } = await req.json();

  const userMessage = `Current slide deck:\n${JSON.stringify(currentState, null, 2)}\n\nTranscript so far:\n"${transcript}"\n\nUpdate the deck if there's new content worth a slide. Return JSON.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Parse failed" }, { status: 500 });
  }

  return NextResponse.json(JSON.parse(jsonMatch[0]));
}
