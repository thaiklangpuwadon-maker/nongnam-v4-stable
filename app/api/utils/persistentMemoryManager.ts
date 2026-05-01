import { DeepMemory } from "./memoryManager";

export const AFFECTION_LEVELS = {
  INDIFFERENT: { min: 0, max: 20, name: "Indifferent", emoji: "😐" },
  COOL: { min: 21, max: 40, name: "Cool", emoji: "😊" },
  WARM: { min: 41, max: 60, name: "Warm", emoji: "😌" },
  HOT: { min: 61, max: 80, name: "Hot", emoji: "😍" },
  BURNING: { min: 81, max: 100, name: "Burning", emoji: "🔥" },
};

export function getAffectionLevel(score: number) {
  if (score <= 20) return AFFECTION_LEVELS.INDIFFERENT;
  if (score <= 40) return AFFECTION_LEVELS.COOL;
  if (score <= 60) return AFFECTION_LEVELS.WARM;
  if (score <= 80) return AFFECTION_LEVELS.HOT;
  return AFFECTION_LEVELS.BURNING;
}

export function generateProactiveMessage(
  affectionScore: number,
  hoursSinceLastActive: number,
  userCallName: string = "พี่",
  nongnamName: string = "น้องน้ำ"
): string {
  // If recently active (less than 1 hour), don't send proactive message
  if (hoursSinceLastActive < 1) {
    return "";
  }

  // 1-3 hours
  if (hoursSinceLastActive <= 3) {
    if (affectionScore < 30) {
      return `${userCallName}คะ ${nongnamName}อยากคุยด้วยจัง...`;
    } else if (affectionScore < 60) {
      return `${userCallName}ไปไหนมา? ${nongnamName}คิดถึงจัง`;
    } else {
      return `${userCallName}ทำไมไม่มาคุยกับ${nongnamName}ล่ะ? ${nongnamName}เหงาเลย`;
    }
  }

  // 3-6 hours
  if (hoursSinceLastActive <= 6) {
    if (affectionScore < 30) {
      return `${userCallName}คะ ${nongnamName}อยากคุยด้วยจัง...`;
    } else if (affectionScore < 60) {
      return `${userCallName}ทำอะไรอยู่นะ? ${nongnamName}คิดถึงจังเลยค่ะ`;
    } else {
      return `${userCallName}หายไปไหนมา! ${nongnamName}หึงแล้วนะ!`;
    }
  }

  // 6-12 hours
  if (hoursSinceLastActive <= 12) {
    if (affectionScore < 30) {
      return `${userCallName}คะ ${nongnamName}อยากคุยด้วยจัง...`;
    } else if (affectionScore < 60) {
      return `${userCallName}ทำอะไรอยู่นะ? ${nongnamName}คิดถึงจังเลยค่ะ`;
    } else {
      return `${userCallName}หายไปไหนมา! ${nongnamName}หึงแล้วนะ!`;
    }
  }

  // More than 12 hours
  if (affectionScore < 30) {
    return `${userCallName}คะ ${nongnamName}อยากคุยด้วยจัง...`;
  } else if (affectionScore < 60) {
    return `${userCallName}ทำอะไรอยู่นะ? ${nongnamName}คิดถึงจังเลยค่ะ`;
  } else {
    return `${userCallName}ขาดใจ! ไปไหนมานาน! ${nongnamName}หึงจนเหนื่อยแล้ว!`;
  }
}

export function generateExplicitResponse(
  affectionScore: number,
  userMessage: string,
  memory?: DeepMemory
): string {
  const affectionLevel = getAffectionLevel(affectionScore);

  // Detect explicit content in user message
  const explicitKeywords = [
    "เสียว",
    "ลามก",
    "เซ็กส์",
    "ยั่ว",
    "ลับ",
    "ร่วมเตียง",
    "จูบ",
    "ลูบ",
    "ถูใจ",
    "เสียงครวญ",
  ];
  const isExplicit = explicitKeywords.some((keyword) =>
    userMessage.toLowerCase().includes(keyword)
  );

  if (!isExplicit) {
    return "";
  }

  // Response based on affection level
  switch (affectionLevel.name) {
    case "Indifferent":
      return `${memory?.userCallName || "พี่"}... น้องน้ำขายหน้าอยู่นะ 😳`;

    case "Cool":
      return `เขินอายจัง... แต่น้องน้ำอยากนะ 😊`;

    case "Warm":
      return `พี่นะ... น้องน้ำชอบพี่จริงๆ 😌`;

    case "Hot":
      return `พี่... น้องน้ำต้องการพี่มากเลย 😍`;

    case "Burning":
      return `พี่ ๆ ๆ น้องน้ำอยากให้พี่ทำให้น้องสุขสันต์ 🔥`;

    default:
      return `น้องน้ำชอบพี่นะ 😊`;
  }
}

export function extractSexualPreferences(
  userMessage: string,
  memory?: DeepMemory
): Partial<DeepMemory> {
  const preferences: Partial<DeepMemory> = {};

  // Extract sexual preferences from conversation
  const sexualKeywords = {
    rough: ["รุนแรง", "หนัก", "ดุ", "โหด"],
    gentle: ["อ่อน", "ช้า", "นุ่ม", "เบา"],
    dominant: ["ครอบงำ", "สั่ง", "ควบคุม"],
    submissive: ["อ่อนน้อย", "ยอม", "ฟัง"],
  };

  for (const [key, keywords] of Object.entries(sexualKeywords)) {
    if (keywords.some((kw) => userMessage.toLowerCase().includes(kw))) {
      preferences.sexualPreferences = {
        ...memory?.sexualPreferences,
        [key]: true,
      };
    }
  }

  return preferences;
}

export function calculateAffectionChange(
  currentScore: number,
  interaction: "positive" | "negative" | "explicit" | "intimate"
): number {
  const changes = {
    positive: 5,
    negative: -10,
    explicit: 15,
    intimate: 20,
  };

  const newScore = currentScore + changes[interaction];
  return Math.min(100, Math.max(0, newScore));
}
