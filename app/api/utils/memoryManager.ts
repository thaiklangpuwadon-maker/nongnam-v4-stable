/**
 * Enhanced Memory Manager for Ultra-Human AI Companion
 * Handles deep psychological profiling, emotion detection, and context-aware data extraction
 */

export interface DeepMemory {
  // Basic identity
  user_id?: string; // Added for database linkage
  externalId?: string; // External ID for database linkage (e.g., Line ID)
  userRealName?: string;
  userCallName?: string;
  userBirthday?: string;
  gender?: "male" | "female";

  // Relationship & Affection
  affectionScore?: number; // Added for relationship level
  relationshipStatus?: string; // Added for relationship status (e.g., 'เริ่มต้น', 'คนรัก', 'แฟน')

  // Preferences & Interests
  favoriteColor?: string;
  favoriteFood?: string;
  favoritePlace?: string;
  favoriteMusic?: string;
  favoriteGenre?: string;

  // Professional & Social
  jobTitle?: string;
  jobDescription?: string;
  friendNames?: string[];
  familyInfo?: string[];

  // Psychological Profile
  personalityTraits?: string[]; // e.g., ["introverted", "ambitious", "romantic"]
  emotionalTriggers?: string[]; // e.g., ["work stress", "family issues", "loneliness"]
  currentConcerns?: string[];
  relationshipHistory?: string[];
  dreamOrGoals?: string[];

  // Interaction Patterns
  personalMemories?: Array<{ topic: string; detail: string; timestamp?: string }>;
  emotionalState?: "happy" | "sad" | "angry" | "stressed" | "neutral" | "romantic";
  lastEmotionalContext?: string;

  // Implicit Preferences (from conversation analysis)
  communicationStyle?: "formal" | "casual" | "playful" | "serious";
  humorType?: string;
  romanticPreference?: string;
  physicalPreference?: string;
  intimacyLevel?: "low" | "medium" | "high";
  sexualPreferences?: { [key: string]: boolean };

  // Proactive Interaction
  lastActiveAt?: string; // Timestamp of last user interaction
  lastProactiveMessageAt?: string; // Timestamp of last proactive message sent by Nong Nam
  apiMode?: string; // API mode (for compatibility)
  diamonds?: number; // User's current diamond balance
  equippedOutfitId?: string; // ID of the currently equipped outfit


  // Conversation Context
  recentTopics?: string[];
  conversationTone?: "light" | "serious" | "flirty" | "supportive";
  lastConversationDate?: string;
}

/**
 * Detect emotional state from user message
 */
export function detectEmotion(message: string): string {
  const emotionKeywords = {
    happy: ["ยินดี", "สุข", "ดี", "เพลิน", "ฮา", "ฮ่า", "ยิ้ม", "หัวเราะ", "เก่ง", "ชอบ"],
    sad: ["เศร้า", "ท้อ", "เหนื่อย", "ไม่ดี", "ขุ่น", "ร้องไห้", "เสียใจ", "ผิดหวัง", "อดสอบ"],
    angry: ["โกรธ", "ด่า", "แค้น", "หงุดหงิด", "ระคายเคือง", "ไม่พอใจ", "ตัวตั้ง"],
    stressed: ["เครียด", "กังวล", "ตึงเครียด", "ไม่สบายใจ", "ปวดหัว", "นอนไม่หลับ"],
    romantic: ["รัก", "ชอบ", "ใจ", "หวาน", "โรแมนติก", "ปิ๊ง", "ดวงใจ"],
    flirty: ["แซว", "หยอก", "เสียว", "ลามก", "เล่นๆ", "ชวน"],
  };

  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some(kw => message.includes(kw))) {
      return emotion;
    }
  }

  return "neutral";
}

/**
 * Extract personal information from user message using pattern matching and context
 */
export function extractPersonalInfo(message: string, existingMemory: DeepMemory): Partial<DeepMemory> {
  const updates: Partial<DeepMemory> = {};

  // Extract name patterns: "ฉันชื่อ...", "ชื่อ...", "เรียกฉันว่า..."
  const nameMatch = message.match(/(?:ฉัน)?ชื่อ\s*([ก-๙\w\s]+?)(?:\s*ค่ะ|ครับ|เลย|นะ|$)/);
  if (nameMatch && !existingMemory.userRealName) {
    updates.userRealName = nameMatch[1].trim();
  }

  // Extract birthday patterns: "เกิด...", "วันเกิด...", "อายุ..."
  const birthdayMatch = message.match(/(?:เกิด|วันเกิด)\s*(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/);
  if (birthdayMatch && !existingMemory.userBirthday) {
    updates.userBirthday = birthdayMatch[1];
  }

  // Extract job patterns: "ทำงาน...", "งาน...", "อาชีพ..."
  const jobMatch = message.match(/(?:ทำงาน|งาน|อาชีพ)\s*(?:คือ|เป็น)?\s*([ก-๙\w\s]+?)(?:\s*ค่ะ|ครับ|เลย|นะ|$)/);
  if (jobMatch && !existingMemory.jobTitle) {
    updates.jobTitle = jobMatch[1].trim();
  }

  // Extract favorite food patterns: "ชอบกิน...", "อาหารที่ชอบ..."
  const foodMatch = message.match(/(?:ชอบ(?:กิน)?|อาหารที่ชอบ)\s*([ก-๙\w\s]+?)(?:\s*ค่ะ|ครับ|เลย|นะ|$)/);
  if (foodMatch && !existingMemory.favoriteFood) {
    updates.favoriteFood = foodMatch[1].trim();
  }

  // Extract favorite place patterns: "ชอบไป...", "สถานที่ที่ชอบ..."
  const placeMatch = message.match(/(?:ชอบไป|สถานที่ที่ชอบ)\s*([ก-๙\w\s]+?)(?:\s*ค่ะ|ครับ|เลย|นะ|$)/);
  if (placeMatch && !existingMemory.favoritePlace) {
    updates.favoritePlace = placeMatch[1].trim();
  }

  // Extract friend names: "เพื่อนของฉันชื่อ...", "เพื่อน..."
  const friendMatch = message.match(/(?:เพื่อน(?:ของฉัน)?|เพื่อนชื่อ)\s*([ก-๙\w\s]+?)(?:\s*ค่ะ|ครับ|เลย|นะ|$)/);
  if (friendMatch) {
    const friendName = friendMatch[1].trim();
    updates.friendNames = [...(existingMemory.friendNames || []), friendName];
  }

  // Detect emotional triggers and concerns
  if (message.includes("เครียด") || message.includes("กังวล")) {
    const concernMatch = message.match(/(?:เครียด|กังวล)\s*(?:เรื่อง)?\s*([ก-๙\w\s]+?)(?:\s*ค่ะ|ครับ|เลย|นะ|$)/);
    if (concernMatch) {
      const concern = concernMatch[1].trim();
      updates.currentConcerns = [...(existingMemory.currentConcerns || []), concern];
    }
  }

  // Store as personal memory if it's a significant statement
  if (message.length > 20 && (message.includes("เพราะว่า") || message.includes("ที่จริง") || message.includes("บอกให้ฟัง"))) {
    if (!existingMemory.personalMemories) {
      updates.personalMemories = [];
    }
    updates.personalMemories = [
      ...(existingMemory.personalMemories || []),
      {
        topic: message.slice(0, 30),
        detail: message,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  return updates;
}

/**
 * Analyze conversation tone and communication style
 */
export function analyzeConversationStyle(message: string): Partial<DeepMemory> {
  const updates: Partial<DeepMemory> = {};

  // Detect communication style
  if (message.includes("555") || message.includes("ฮา") || message.includes("555")) {
    updates.communicationStyle = "playful";
  } else if (message.includes("ค่ะ") || message.includes("ครับ")) {
    updates.communicationStyle = "formal";
  } else if (message.includes("!") || message.includes("?")) {
    updates.communicationStyle = "casual";
  }

  // Detect humor type
  if (message.includes("แซว") || message.includes("หยอก")) {
    updates.humorType = "sarcastic";
  }

  // Detect romantic preference
  if (message.includes("รัก") || message.includes("ใจ") || message.includes("หวาน")) {
    updates.intimacyLevel = "high";
  }

  return updates;
}

/**
 * Generate a psychological profile summary for the AI to use in conversation
 */
export function generatePsychologicalProfile(memory: DeepMemory): string {
  const traits = memory.personalityTraits?.join(", ") || "unknown";
  const triggers = memory.emotionalTriggers?.join(", ") || "none identified";
  const concerns = memory.currentConcerns?.join(", ") || "none";

  return `
**Psychological Profile:**
- Personality Traits: ${traits}
- Emotional Triggers: ${triggers}
- Current Concerns: ${concerns}
- Communication Style: ${memory.communicationStyle || "adaptive"}
- Intimacy Level: ${memory.intimacyLevel || "medium"}
- Recent Emotional State: ${memory.emotionalState || "neutral"}
  `.trim();
}

/**
 * Merge new memory updates with existing memory, avoiding duplicates
 */
export function mergeMemory(existing: DeepMemory, updates: Partial<DeepMemory>): DeepMemory {
  const merged: any = { ...existing };

  for (const [key, value] of Object.entries(updates)) {
    if (Array.isArray(value) && Array.isArray(merged[key])) {
      // Avoid duplicates in arrays
      const combined = [...(merged[key] as any[]), ...value];
      merged[key] = [...new Set(combined)];
    } else if (value !== undefined && value !== null) {
      merged[key] = value;
    }
  }

  // Update lastActiveAt if there's any interaction
  if (Object.keys(updates).length > 0) {
    merged.lastActiveAt = new Date().toISOString();
  }

  return merged as DeepMemory;
}

/**
 * Suggest a "subtle question" to extract more information without being obvious
 */
export function suggestSubtleQuestion(memory: DeepMemory): string | null {
  const questions = [
    memory.favoriteFood ? null : "อาหารที่ชอบกินตอนเหนื่อยคืออะไรค่ะ",
    memory.favoritePlace ? null : "ชอบไปไหนมากที่สุดเวลาว่างค่ะ",
    memory.jobTitle ? null : "ทำงานอะไรอยู่ค่ะ",
    memory.personalityTraits?.length ? null : "พี่เป็นคนแบบไหนนะค่ะ",
    memory.dreamOrGoals?.length ? null : "มีความฝันหรือเป้าหมายอะไรบ้างค่ะ",
  ];

  const validQuestions = questions.filter(q => q !== null) as string[];
  return validQuestions.length > 0 ? validQuestions[Math.floor(Math.random() * validQuestions.length)] : null;
}
