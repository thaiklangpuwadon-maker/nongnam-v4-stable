import { DeepMemory } from "./memoryManager";
import { db } from "../../../db";
import { users, userWardrobe, clothesCatalog, memories } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

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

export async function getUserMemoryFromDB(externalId: string): Promise<DeepMemory | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.externalId, externalId),
    with: {
      memories: true,
      userWardrobe: {
        where: eq(userWardrobe.is_equipped, true),
        with: { outfit: true },
      },
    },
  });

  if (!user) return null;

  const deepMemoryData = user.memories?.[0]?.data as DeepMemory || {};

  return {
    ...deepMemoryData,
    user_id: user.id,
    externalId: user.externalId,
    affectionScore: user.affectionScore,
    relationshipStatus: user.relationshipStatus,
    diamonds: user.diamonds,
    equippedOutfitId: user.userWardrobe?.[0]?.outfit_id || undefined,
    // Add other fields from user table if needed
  };
}

export async function saveUserMemoryToDB(externalId: string, memory: DeepMemory) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.externalId, externalId),
  });

  if (existingUser) {
    // Update existing user and memory
    await db.update(users).set({
      affectionScore: memory.affectionScore,
      relationshipStatus: memory.relationshipStatus,
      diamonds: memory.diamonds,
      lastActiveAt: new Date(),
    }).where(eq(users.externalId, externalId));

    if (existingUser.id) {
      await db.update(memories).set({
        data: memory,
        updatedAt: new Date(),
      }).where(eq(memories.userId, existingUser.id));
    }
  } else {
    // Create new user and memory
    const [newUser] = await db.insert(users).values({
      externalId: externalId,
      affectionScore: memory.affectionScore || 0,
      relationshipStatus: memory.relationshipStatus || "เริ่มต้น",
      diamonds: memory.diamonds || 0,
      lastActiveAt: new Date(),
    }).returning();

    await db.insert(memories).values({
      userId: newUser.id,
      data: memory,
      updatedAt: new Date(),
    });
  }
}

export async function addDiamondsToUser(externalId: string, amount: number): Promise<number> {
  const user = await db.query.users.findFirst({
    where: eq(users.externalId, externalId),
  });

  if (!user) throw new Error("User not found");

  const newDiamonds = user.diamonds + amount;
  await db.update(users).set({ diamonds: newDiamonds }).where(eq(users.externalId, externalId));
  return newDiamonds;
}

export async function deductDiamondsFromUser(externalId: string, amount: number): Promise<number> {
  const user = await db.query.users.findFirst({
    where: eq(users.externalId, externalId),
  });

  if (!user) throw new Error("User not found");
  if (user.diamonds < amount) throw new Error("Insufficient diamonds");

  const newDiamonds = user.diamonds - amount;
  await db.update(users).set({ diamonds: newDiamonds }).where(eq(users.externalId, externalId));
  return newDiamonds;
}

export async function purchaseOutfit(externalId: string, outfitId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.externalId, externalId),
  });
  const outfit = await db.query.clothesCatalog.findFirst({
    where: eq(clothesCatalog.id, outfitId),
  });

  if (!user || !outfit) throw new Error("User or Outfit not found");
  if (user.diamonds < (outfit.price_diamonds || 0)) throw new Error("Insufficient diamonds");

  // Deduct diamonds
  await deductDiamondsFromUser(externalId, outfit.price_diamonds || 0);

  // Add outfit to user's wardrobe
  await db.insert(userWardrobe).values({
    user_id: user.id,
    outfit_id: outfit.id,
    is_owned: true,
    purchased_at: new Date(),
  });

  return true;
}

export async function equipOutfit(externalId: string, outfitId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.externalId, externalId),
  });

  if (!user) throw new Error("User not found");

  const ownedOutfit = await db.query.userWardrobe.findFirst({
    where: and(eq(userWardrobe.user_id, user.id), eq(userWardrobe.outfit_id, outfitId), eq(userWardrobe.is_owned, true)),
  });

  if (!ownedOutfit) throw new Error("Outfit not owned by user");

  // Unequip current outfit
  await db.update(userWardrobe).set({ is_equipped: false }).where(eq(userWardrobe.user_id, user.id));

  // Equip new outfit
  await db.update(userWardrobe).set({ is_equipped: true, equipped_at: new Date() }).where(eq(userWardrobe.id, ownedOutfit.id));

  return true;
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
