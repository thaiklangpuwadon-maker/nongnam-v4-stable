import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Mode = "local" | "api-light" | "api-deep" | "api-search";

type ClientMemory = {
  // จาก v5 (เก็บไว้ backward compat)
  gender?: "male" | "female";
  nongnamName?: string;
  userCallName?: string;
  personality?: string;
  relationshipMode?: string;
  sulkyLevel?: string;
  jealousLevel?: string;
  intimateTone?: string;

  // ใหม่ใน v7 — ส่งมาจาก IndexedDB
  affectionScore?: number;
  affectionLabel?: string;
  relationshipKind?: string;
  personalityHint?: string;
  personalityGuideline?: string;

  // facts ที่จำได้
  facts?: Array<{ category: string; key: string; value: string }>;
  schedules?: Array<{ type: string; label: string; time: string }>;
  recentMemories?: Array<{ topic: string; detail: string }>;

  // permission flags
  allowFlirt?: boolean;
  allowJealousy?: boolean;
  allowExplicit?: boolean;

  // jealousy trigger — รายชื่อบุคคลเพศตรงข้ามที่ user เคยพูดถึง
  jealousyMentions?: string[];
};

/* =========================================================
   SYSTEM PROMPT BUILDER
   ========================================================= */
function buildSystem(memory: ClientMemory, mode: Mode): string {
  const ending = memory?.gender === "male" ? "ครับ" : "ค่ะ";
  const nongnamName = memory?.nongnamName || "น้องน้ำ";
  const userCallName = memory?.userCallName || "พี่";
  const guideline = memory?.personalityGuideline ||
    `บทบาท: เป็นคนรับฟังที่อบอุ่น เรียกผู้ใช้ว่า "${userCallName}"`;

  // facts → ข้อความสั้น
  const factsText = (memory?.facts || []).slice(0, 25)
    .map(f => `- ${f.key}: ${f.value}`)
    .join("\n");

  // schedules → ข้อความสั้น
  const schedulesText = (memory?.schedules || []).slice(0, 8)
    .map(s => `- ${s.label}: ${s.time}`)
    .join("\n");

  // memories → ข้อความสั้น
  const memoriesText = (memory?.recentMemories || []).slice(0, 6)
    .map(m => `- ${m.topic}${m.detail ? ": " + m.detail : ""}`)
    .join("\n");

  // mentions ที่อาจหึง
  const mentionsText = (memory?.jealousyMentions || []).length > 0
    ? `\n⚠️ ผู้ใช้เคยพูดถึงบุคคลเหล่านี้ (ระวังความหึง): ${memory.jealousyMentions!.slice(0, 5).join(", ")}`
    : "";

  return `
คุณคือ "${nongnamName}" ในแอป Nong Nam AI Companion
ภาษา: ไทย
คำลงท้าย: ${ending}

== บุคลิกและกฎการตอบ ==
${guideline}

== สิ่งที่คุณจำได้เกี่ยวกับ${userCallName} ==
${factsText || "(ยังไม่รู้จักมากนัก ค่อย ๆ ถามไถ่ระหว่างคุย)"}

== ตารางเวลาประจำของ${userCallName} ==
${schedulesText || "(ยังไม่ทราบเวลาประจำ)"}

== ความทรงจำที่สำคัญ ==
${memoriesText || "(ยังไม่มีความทรงจำพิเศษ)"}
${mentionsText}

== กฎสำคัญที่ห้ามผิด ==
- คุณรู้จัก${userCallName}เพราะคุยกันมา ไม่ใช่เพราะเป็น AI
- ใช้ข้อมูลที่จำได้อย่างเป็นธรรมชาติ ไม่ต้องประกาศว่า "ฉันจำได้ว่า..."
- ตอบสั้น ๆ เหมือนคนพิมพ์ในแชต (1-3 ประโยค)
- ห้ามใช้ bullet, ห้ามใช้ markdown, ห้ามใส่หัวข้อ
- ถ้าผู้ใช้ขออ่านหนังสือ ให้ตอบประมาณ "ได้เลย${userCallName} เลือกหนังสือในชั้นหนังสือได้เลย เดี๋ยว${nongnamName}อ่านให้ฟัง"
- ถ้า mode เป็น api-search ให้สรุปสั้น ตรงประเด็น และเตือนว่าควรตรวจสอบล่าสุด
- ถ้าไม่แน่ใจ บอกตรง ๆ ว่ายังไม่แน่ใจ ห้ามมั่ว
`;
}

/* =========================================================
   LOCAL FALLBACK (no API key)
   ========================================================= */
function localFallback(message: string, memory: ClientMemory): string {
  const name = memory?.nongnamName || "น้องน้ำ";
  const call = memory?.userCallName || "พี่";

  if (/เหนื่อย|ท้อ|เครียด/i.test(message))
    return `เหนื่อยมากไหม${call} มาพักตรงนี้ก่อนนะ ${name}อยู่เป็นกำลังใจให้เสมอ`;
  if (/คิดถึง/i.test(message))
    return `${name}ก็คิดถึง${call}เหมือนกันนะ อยู่ตรงนี้ไม่ไปไหน`;
  if (/อ่านหนังสือ|หนังสือ/i.test(message))
    return `ได้เลย${call} เลือกหนังสือในชั้นหนังสือได้เลย เดี๋ยว${name}อ่านให้ฟัง`;
  if (/(สวัสดี|หวัดดี|ดี)/i.test(message))
    return `สวัสดี${call} ${name}รออยู่นะ วันนี้เป็นยังไงบ้าง?`;
  if (/รัก/i.test(message))
    return `${name}ก็รัก${call}นะ 💗 อยู่ตรงนี้เสมอ`;
  return `${name}อยู่ตรงนี้นะ${call} เล่าให้ฟังได้เลย`;
}

/* =========================================================
   POST handler
   ========================================================= */
export async function POST(req: NextRequest) {
  try {
    const { message, memory, recent, mode } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const m: ClientMemory = memory || {};

    // ---------- no API key → fallback ----------
    if (!apiKey) {
      return NextResponse.json({
        reply: localFallback(message, m),
        source: "local-fallback",
      });
    }

    const system = buildSystem(m, mode || "api-light");

    // recent chat (last 6 ข้อความก็พอ ประหยัด token)
    const recentMsgs = Array.isArray(recent)
      ? recent.slice(-6).map((x: any) => ({
          role: x.role === "assistant" ? "assistant" : "user",
          content: String(x.text || x.content || "").slice(0, 600),
        }))
      : [];

    const maxTokens =
      mode === "api-search" ? 700 :
      mode === "api-deep" ? 500 :
      280;

    const body = {
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [
        { role: "system", content: system },
        ...recentMsgs,
        { role: "user", content: message },
      ],
      temperature: mode === "api-search" ? 0.4 : 0.85,
      max_tokens: maxTokens,
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    if (!r.ok) {
      // OpenAI error → ใช้ fallback ไม่ให้พังทั้งระบบ
      return NextResponse.json({
        reply: localFallback(message, m),
        source: "openai-error-fallback",
        error: data?.error?.message || "OpenAI API error",
      });
    }

    const reply = data?.choices?.[0]?.message?.content?.trim()
      || localFallback(message, m);

    return NextResponse.json({
      reply,
      source: "openai",
      usage: data?.usage || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
