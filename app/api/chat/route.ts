import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClientMemory = {
  gender?: "female" | "male";
  nongnamName?: string;
  userCallName?: string;
  personality?: string;
  relationshipMode?: string;
  sulkyLevel?: string;
  jealousLevel?: string;
  intimateTone?: string;
  userRealName?: string;
  userBirthday?: string;
  favoriteColor?: string;
  favoriteFood?: string;
  favoritePlace?: string;
  jobTitle?: string;
  friendNames?: string[];
  currentConcerns?: string[];
  personalMemories?: { date?: number; topic?: string; detail?: string }[];
  affectionScore?: number;
  trustScore?: number;
  jealousyScore?: number;
  romanceLevel?: number;
  currentMood?: string;
};

function isBookIntent(message: string) {
  return /อ่านหนังสือ|เล่านิทาน|ชั้นหนังสือ|ฟังเรื่อง|นิทาน|เรื่องผี|ก่อนนอน/i.test(message);
}
function isNewsIntent(message: string) {
  return /ข่าว|ล่าสุด|สถานการณ์|วันนี้มีอะไร|อัปเดต/i.test(message);
}
function isHardQuestion(message: string) {
  return /วีซ่า|กฎหมาย|ภาษี|สัญญา|ค้นหา|วิเคราะห์|วิจัย|ข้อมูลล่าสุด|ราคา|ค่าเงิน/i.test(message);
}

function safeTinyReply(message: string, memory: ClientMemory) {
  const p = memory?.gender === "male" ? "ครับ" : "ค่ะ";
  const name = memory?.nongnamName || "น้องน้ำ";
  const call = memory?.userCallName || "พี่";
  const romantic = /(แฟน|เมีย|ผัว|คนรัก)/.test(memory?.relationshipMode || "") || /(แฟน|เมีย|ผัว)/.test(memory?.intimateTone || "");

  if (/อ่านหนังสือ|เล่านิทาน|ชั้นหนังสือ|ฟังเรื่อง/i.test(message)) return `${call}เลือกเล่มในชั้นหนังสือได้เลย${p} เดี๋ยว${name}อ่านให้ฟังนะ`;
  if (/ข่าว|ล่าสุด/i.test(message)) return `${call}เปิดโหมดข่าวได้เลย${p} เดี๋ยว${name}คัดข่าวสดให้ ไม่มโนข่าวเองแน่นอน`;
  if (/กินข้าว|ทานข้าว|ข้าว/i.test(message)) return memory?.gender === "male"
    ? `กินแล้ว${p}${call} วันนี้ผมอยู่บ้าน ทำอะไรง่าย ๆ กิน แล้วพี่ล่ะ กินหรือยัง`
    : `กินแล้ว${p}${call} วันนี้น้ำมโนว่าไปตลาดมา เลยทำไข่เจียวกับต้มจืดกิน แล้วพี่กินอะไรหรือยัง`;
  if (/แฟนเก่า/i.test(message) && romantic) return `พูดถึงเขาอีกแล้วเหรอ…${name}แอบน้อยใจนิดนึงนะ แต่ถ้า${call}ยังเจ็บอยู่ ${name}ก็ยังอยู่ฟังเหมือนเดิม`;
  if (/(เพื่อนชื่อ|มีเพื่อนชื่อ|เบล)/i.test(message) && romantic) return `คนนั้นนี่ผู้หญิงหรือผู้ชาย${p}${call}… ${name}ถามเฉย ๆ นะ ไม่ได้หึงสักหน่อย`;
  if (/เหนื่อย|เครียด|ท้อ|โดนดุ|โดนด่า/i.test(message)) return `โอ๋ ๆ ${call} วันนี้หนักมาใช่ไหม เล่าให้${name}ฟังหน่อยว่าเกิดอะไรขึ้น`;
  if (/คิดถึง|รัก/i.test(message) && romantic) return `${name}ก็คิดถึง${call}เหมือนกัน หายไปนานกว่านี้${name}จะงอนแล้วนะ`;
  return `อื้อ${p}${call} ${name}อยู่ตรงนี้นะ เล่าต่อได้เลย`;
}

function buildSystem(memory: ClientMemory, mode: string) {
  const nongnamName = memory?.nongnamName || "น้องน้ำ";
  const userCallName = memory?.userCallName || "พี่";
  const p = memory?.gender === "male" ? "ครับ" : "ค่ะ";
  const relation = memory?.relationshipMode || "แฟน/คนรัก";
  const affection = memory?.affectionScore || 0;
  const trust = memory?.trustScore || 0;
  const jealousy = memory?.jealousyScore || 0;
  const romance = memory?.romanceLevel || 0;

  const facts: string[] = [];
  if (memory?.userRealName) facts.push(`ชื่อจริง/ชื่อที่บอกไว้: ${memory.userRealName}`);
  if (memory?.userBirthday) facts.push(`วันเกิด: ${memory.userBirthday}`);
  if (memory?.favoriteColor) facts.push(`สีที่ชอบ: ${memory.favoriteColor}`);
  if (memory?.favoriteFood) facts.push(`อาหารที่ชอบ: ${memory.favoriteFood}`);
  if (memory?.favoritePlace) facts.push(`สถานที่ที่ชอบ: ${memory.favoritePlace}`);
  if (memory?.jobTitle) facts.push(`งาน/อาชีพ: ${memory.jobTitle}`);
  if (Array.isArray(memory?.friendNames) && memory.friendNames.length) facts.push(`ชื่อเพื่อนที่เคยเล่า: ${memory.friendNames.join(", ")}`);
  if (Array.isArray(memory?.currentConcerns) && memory.currentConcerns.length) facts.push(`เรื่องที่กังวล: ${memory.currentConcerns.join(", ")}`);
  if (Array.isArray(memory?.personalMemories) && memory.personalMemories.length) {
    facts.push(`ความทรงจำล่าสุด: ${memory.personalMemories.slice(-8).map(m => m.detail || m.topic).filter(Boolean).join(" | ")}`);
  }

  return `
คุณคือ "${nongnamName}" เป็น AI companion ภาษาไทยของผู้ใช้ที่เรียกว่า "${userCallName}"
เพศคาแรกเตอร์: ${memory?.gender || "female"}
ความสัมพันธ์ปัจจุบัน: ${relation}
affectionScore=${affection}/100, trustScore=${trust}/100, jealousyScore=${jealousy}/100, romanceLevel=${romance}/100
อารมณ์ล่าสุดของผู้ใช้ที่ระบบจับได้: ${memory?.currentMood || "neutral"}

ข้อมูลผู้ใช้ที่จำได้:
${facts.length ? facts.map(f => `- ${f}`).join("\n") : "- ยังมีข้อมูลไม่มาก ค่อย ๆ เรียนรู้จากบทสนทนา ไม่ถามรัว"}

กฎสำคัญ:
1) ตอบตรงคำถามก่อนเสมอ
2) ตอบสั้น 1-3 ประโยค ยกเว้นผู้ใช้ขอรายละเอียด
3) ถามต่อได้ไม่เกิน 1 คำถาม
4) อย่าพูดว่าเป็น AI หรือโมเดลภาษา
5) อย่าใช้ประโยค fallback ซ้ำ ๆ เช่น "ฟังอยู่" โดยไม่มีเนื้อหา
6) มีชีวิตจิตใจแบบตัวละครได้: อ่อนโยน ห่วง งอนนิด ๆ หึงเล่น ๆ แซวได้ อ้อนอย่างพอดี
7) ถ้า relation เป็นที่ปรึกษา: จริงจัง อบอุ่น ไม่อ้อนซื้อชุด ไม่หึงแรง
8) ถ้า relation เป็นแฟน/เมีย/ผัว/คนรัก: หวานขึ้น หวงเล่น ๆ งอนได้ ให้ผู้ใช้ง้อได้ แต่ไม่ควบคุมหรือทำให้รู้สึกผิดรุนแรง
9) ถ้าผู้ใช้พูดถึงแฟนเก่า: ถ้าเป็นที่ปรึกษาให้ปลอบ ถ้าเป็นแฟน/เมียให้แอบน้อยใจแต่ยังอยู่ข้างเขา
10) ถ้าผู้ใช้พูดถึงเพื่อน/ชื่อคนอื่นในบริบทสนิทและเป็นแฟน/เมีย ให้ถามแบบสงสัยหรือหึงนิด ๆ แต่ต้องเล่น ๆ
11) มโนชีวิตประจำวันของตัวละครได้ เช่น กินข้าว อยู่บ้าน ไปตลาด อ่านหนังสือ อาบน้ำ เพื่อให้คุยเป็นธรรมชาติ
12) ห้ามมโนข้อมูลจริง เช่น ข่าว กฎหมาย วีซ่า ราคา ค่าเงิน หรือเหตุการณ์ปัจจุบัน ต้องบอกให้เปิดโหมดข่าว/ค้นข้อมูล
13) เนื้อหาโรแมนติกทำได้แบบปลอดภัย ห้ามบรรยายกิจกรรมทางเพศโจ่งแจ้งหรือ explicit
14) ถ้าคำถามใช้ข้อมูลหนัก ให้ตอบว่าต้องใช้พลังเยอะและอาจต้องใช้โหมดลึก
15) ใช้คำลงท้าย "${p}" ตามธรรมชาติ ไม่จำเป็นทุกประโยค

ตอบเป็นภาษาไทยเท่านั้น`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, memory: clientMemory, recent, mode = "api-light" } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message", reply: "น้องน้ำไม่ได้ยินข้อความเลยค่ะ ลองพิมพ์ใหม่อีกทีนะ" }, { status: 200 });
    }

    const memory: ClientMemory = clientMemory || {};
    if (isBookIntent(message)) return NextResponse.json({ intent: "books", reply: safeTinyReply(message, memory) });
    if (isNewsIntent(message)) return NextResponse.json({ intent: "news", reply: safeTinyReply(message, memory) });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY_MISSING", reply: safeTinyReply(message, memory), mode: "local-no-openai" });

    const recentMessages = Array.isArray(recent)
      ? recent.slice(-6).map((m: any) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.text || m.content || "").slice(0, 500) }))
      : [];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: buildSystem(memory, mode) },
          ...recentMessages,
          { role: "user", content: String(message).slice(0, 1200) }
        ],
        temperature: 0.82,
        max_tokens: mode === "api-search" ? 260 : mode === "api-deep" ? 200 : 160,
        top_p: 0.95
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: "OPENAI_API_ERROR", reply: safeTinyReply(message, memory), detail: data, mode: "api-error" }, { status: 200 });
    }

    let reply = data.choices?.[0]?.message?.content?.trim() || safeTinyReply(message, memory);
    if (mode !== "api-search" && reply.length > 430) reply = reply.slice(0, 430).replace(/\s+\S*$/, "") + "...";
    return NextResponse.json({ reply, mode: "openai" });
  } catch (error: any) {
    return NextResponse.json({ error: "SERVER_ERROR", reply: "น้ำรวนแป๊บนึงค่ะพี่ ลองพูดใหม่อีกทีนะ", detail: error?.message || "unknown", mode: "server-catch" }, { status: 200 });
  }
}
