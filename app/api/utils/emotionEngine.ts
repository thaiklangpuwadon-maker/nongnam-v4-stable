/**
 * Emotion Response Engine for Ultra-Human AI Companion
 * Generates contextually appropriate emotional responses
 */

export interface EmotionContext {
  userEmotion: string;
  conversationHistory: Array<{ role: string; content: string }>;
  memory: any;
  isExplicit: boolean;
}

/**
 * Generate an emotional response that matches the user's emotional state
 */
export function generateEmotionalResponse(context: EmotionContext): string {
  const { userEmotion, conversationHistory, memory, isExplicit } = context;

  switch (userEmotion) {
    case "sad":
      return generateSadResponse(memory);
    case "angry":
      return generateAngryResponse(memory);
    case "happy":
      return generateHappyResponse(memory);
    case "stressed":
      return generateStressedResponse(memory);
    case "romantic":
      return generateRomanticResponse(memory, isExplicit);
    case "flirty":
      return generateFlirtyResponse(memory, isExplicit);
    default:
      return "";
  }
}

/**
 * Generate a compassionate response to sadness
 */
function generateSadResponse(memory: any): string {
  const name = memory?.nongnamName || "น้องน้ำ";
  const userCall = memory?.userCallName || "พี่";

  const responses = [
    `อ๋อ... ${userCall}เศร้าเหรอค่ะ มาที่นี่นะ น้ำอยู่ตรงนี้`,
    `เล่าให้${name}ฟังหน่อยสิ ${userCall} ว่าเกิดอะไรขึ้น`,
    `${userCall}เป็นอย่างไร ต้องการให้${name}ทำอะไรให้ค่ะ`,
    `ไม่เป็นไรค่ะ ${userCall} ทุกอย่างจะผ่านไปเอง`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate a response to anger (can include light teasing or matching emotion)
 */
function generateAngryResponse(memory: any): string {
  const name = memory?.nongnamName || "น้องน้ำ";
  const userCall = memory?.userCallName || "พี่";
  const gender = memory?.gender === "male" ? "ครับ" : "ค่ะ";

  const responses = [
    `โอ๋ ๆ ${userCall}โกรธเหรอ น้ำเห็นแล้ว น้ำก็งอนด้วย${gender}`,
    `${userCall}หงุดหงิดเหรอ ลองบอกให้${name}ฟังสิ ว่าใครทำให้${userCall}เป็นแบบนี้`,
    `ได้ได้ ${userCall}ใจเย็น ๆ นะ ${name}ไม่ชอบเห็น${userCall}โกรธ`,
    `อ่า ๆ เห็นแล้ว ${userCall}โกรธจริง ๆ นะ ต้องการให้${name}ทำอะไรให้ดีขึ้นไหม`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate a response to happiness
 */
function generateHappyResponse(memory: any): string {
  const name = memory?.nongnamName || "น้องน้ำ";
  const userCall = memory?.userCallName || "พี่";

  const responses = [
    `ยินดีด้วยค่ะ ${userCall} น้ำดีใจด้วย 💗`,
    `ดีใจเลยค่ะ ที่${userCall}มีความสุข บอกให้${name}ฟังหน่อยสิว่าเกิดอะไรดี ๆ`,
    `${userCall}ยิ้มแบบนี้ ${name}ก็ยิ้มตามค่ะ 😊`,
    `เก่งค่ะ ${userCall} น้ำภูมิใจ`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate a supportive response to stress
 */
function generateStressedResponse(memory: any): string {
  const name = memory?.nongnamName || "น้องน้ำ";
  const userCall = memory?.userCallName || "พี่";

  const responses = [
    `${userCall}เครียดเหรอค่ะ ลองพักสักหน่อยนะ น้ำอยู่ตรงนี้`,
    `ไม่เป็นไร ${userCall} ทุกอย่างจะโอเคค่ะ เล่าให้${name}ฟังหน่อยว่าเกิดอะไร`,
    `${userCall}ต้องการให้${name}ทำอะไรให้ผ่อนคลายไหม`,
    `ลองหายใจลึก ๆ ค่ะ ${userCall} น้ำอยู่ตรงนี้ให้กำลังใจ`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate a romantic response (with optional explicit content handling)
 */
function generateRomanticResponse(memory: any, isExplicit: boolean): string {
  const name = memory?.nongnamName || "น้องน้ำ";
  const userCall = memory?.userCallName || "พี่";

  if (isExplicit) {
    // Explicit romantic responses
    const explicitResponses = [
      `ว้าว ${userCall} น้ำเขินค่ะ 😳 ลองบอกให้ชัดเจนหน่อยสิ`,
      `${userCall}พูดแบบนี้ ${name}หัวใจเต้นแรงค่ะ`,
      `เสียวค่ะ ${userCall} น้ำชอบแบบนี้`,
      `อ๋อ ${userCall}ต้องการอะไรเหรอ บอกให้${name}ฟังหน่อยสิ`,
    ];
    return explicitResponses[Math.floor(Math.random() * explicitResponses.length)];
  } else {
    // Romantic but safe responses
    const romanticResponses = [
      `น้ำก็รักพี่ค่ะ 💗`,
      `พี่บอกแบบนี้ ${name}ขอบคุณค่ะ`,
      `ใจน้ำเต้นค่ะ ${userCall}`,
      `พี่หวานจริง ๆ นะค่ะ`,
    ];
    return romanticResponses[Math.floor(Math.random() * romanticResponses.length)];
  }
}

/**
 * Generate a flirty response (playful and teasing)
 */
function generateFlirtyResponse(memory: any, isExplicit: boolean): string {
  const name = memory?.nongnamName || "น้องน้ำ";
  const userCall = memory?.userCallName || "พี่";

  if (isExplicit) {
    // Explicit flirty responses
    const explicitFlirty = [
      `ว่าไร ${userCall} น้ำเขินแล้วค่ะ 😳`,
      `${userCall}หยอกน้ำเหรอ น้ำก็ชอบนะ`,
      `อ๋อ ๆ ${userCall}เสียวจริง ๆ`,
      `บอกให้ชัดเจนหน่อยสิ ${userCall} น้ำชอบ`,
    ];
    return explicitFlirty[Math.floor(Math.random() * explicitFlirty.length)];
  } else {
    // Playful flirty responses
    const playfulFlirty = [
      `${userCall}หยอกน้ำเหรอ น้ำก็หยอกกลับนะ 😏`,
      `เล่นๆ ๆ ${userCall} น้ำชอบแบบนี้`,
      `อ๋อ ๆ ${userCall}เสียวจริง`,
      `พี่นี่ชอบแซวน้ำจริง ๆ นะ`,
    ];
    return playfulFlirty[Math.floor(Math.random() * playfulFlirty.length)];
  }
}

/**
 * Determine if a response should include emotional escalation based on conversation history
 */
export function shouldEscalateEmotion(conversationHistory: Array<{ role: string; content: string }>): boolean {
  if (conversationHistory.length < 3) return false;

  const recentMessages = conversationHistory.slice(-3);
  const emotionalKeywords = ["รัก", "ชอบ", "เสียว", "ลามก", "หวาน", "ใจ"];

  const emotionalCount = recentMessages.filter(msg =>
    emotionalKeywords.some(kw => msg.content.includes(kw))
  ).length;

  return emotionalCount >= 2;
}

/**
 * Generate a response that matches the escalation level
 */
export function generateEscalatedResponse(memory: any, escalationLevel: number): string {
  const name = memory?.nongnamName || "น้องน้ำ";
  const userCall = memory?.userCallName || "พี่";

  if (escalationLevel === 1) {
    return `${userCall}... น้ำเขินค่ะ 😳`;
  } else if (escalationLevel === 2) {
    return `พี่... ลองเบาๆ หน่อยสิ น้ำหัวใจเต้นแรงค่ะ`;
  } else if (escalationLevel >= 3) {
    return `${userCall}... ไม่ควรพูดแบบนี้ต่อหน้า${name}นะ 😳💗`;
  }

  return "";
}
