import { DeepMemory } from "./memoryManager";
import { db } from "../../../db";
import { userWardrobe, clothesCatalog } from "../../../db/schema";
import { eq, and } from "drizzle-orm";

export interface OutfitContext {
  outfitId: string;
  outfitName: string;
  category: string;
  imageUrlBase: string;
  imageUrlPreview: string;
  is18Plus: boolean;
  sceneContext?: string; // e.g., "ทะเล" for swimsuit, "ห้องนอน" for sleepwear
  emotionalContext?: string; // e.g., "เสียว", "อ่อนหวาน", "เซ็กซี่"
  affectionRequired?: number; // Minimum affection score to wear this outfit
}

export interface WardrobeState {
  currentOutfitId: string | null;
  currentOutfitContext: OutfitContext | null;
  ownedOutfits: OutfitContext[];
  totalOutfits: number;
}

// Map outfit categories to scene contexts
const CATEGORY_TO_SCENE: Record<string, string> = {
  "ชุดว่ายน้ำ": "ทะเล, สระว่ายน้ำ, ชายหาด",
  "ชุดนอน": "ห้องนอน, เตียง, ห้องส่วนตัว",
  "ชุดเซ็กซี่": "ห้องนอน, ห้องส่วนตัว, ที่ส่วนตัว",
  "ชุดเสื้อสั้น": "ที่บ้าน, ห้องนั่งเล่น, ห้องครัว",
  "ชุดราตรี": "ร้านอาหาร, ห้องนั่งเล่น, ที่พักผ่อน",
  "ชุดกีฬา": "ห้องออกกำลัง, สนามกีฬา, ที่ออกกำลังกาย",
};

// Map outfit categories to emotional contexts
const CATEGORY_TO_EMOTION: Record<string, string> = {
  "ชุดว่ายน้ำ": "เสียว, อ่อนหวาน",
  "ชุดนอน": "เสียว, ลามก, อ่อนหวาน",
  "ชุดเซ็กซี่": "เสียว, ลามก, ร้อนแรง",
  "ชุดเสื้อสั้น": "อ่อนหวาน, สดใส",
  "ชุดราตรี": "เสียว, สง่า, เซ็กซี่",
  "ชุดกีฬา": "สดใส, กระฉับกระเฉง",
};

export async function getUserWardrobeState(externalId: string): Promise<WardrobeState> {
  const user = await db.query.users.findFirst({
    where: eq(users.externalId, externalId),
    with: {
      userWardrobe: {
        with: { outfit: true },
      },
    },
  });

  if (!user) {
    return {
      currentOutfitId: null,
      currentOutfitContext: null,
      ownedOutfits: [],
      totalOutfits: 0,
    };
  }

  const equippedOutfit = user.userWardrobe?.find((w) => w.is_equipped);
  const ownedOutfits = user.userWardrobe?.filter((w) => w.is_owned) || [];

  const currentOutfitContext = equippedOutfit
    ? mapOutfitToContext(equippedOutfit.outfit)
    : null;

  const ownedOutfitContexts = ownedOutfits.map((w) =>
    mapOutfitToContext(w.outfit)
  );

  return {
    currentOutfitId: equippedOutfit?.outfit_id || null,
    currentOutfitContext,
    ownedOutfits: ownedOutfitContexts,
    totalOutfits: ownedOutfits.length,
  };
}

export function mapOutfitToContext(outfit: typeof clothesCatalog.$inferSelect): OutfitContext {
  return {
    outfitId: outfit.id,
    outfitName: outfit.name,
    category: outfit.category,
    imageUrlBase: outfit.image_url_base,
    imageUrlPreview: outfit.image_url_preview || outfit.image_url_base,
    is18Plus: outfit.is_18_plus,
    sceneContext: CATEGORY_TO_SCENE[outfit.category] || "ที่ส่วนตัว",
    emotionalContext: CATEGORY_TO_EMOTION[outfit.category] || "อ่อนหวาน",
  };
}

export function generateOutfitSuggestion(
  affectionScore: number,
  conversationTopic?: string,
  currentOutfitContext?: OutfitContext
): string {
  // Suggest outfit based on affection and conversation
  const suggestions: Record<number, string[]> = {
    0: [
      "น้องน้ำอยากได้ชุดใหม่จัง... ชุดสดใสๆ ซักตัวนะ",
      "พี่ซื้อชุดให้น้องหน่อยสิ... น้องอยากได้ชุดเสื้อสั้นสีสวย",
    ],
    1: [
      "พี่คะ... น้องเห็นชุดเซ็กซี่ในแคตตาล็อก น้องอยากได้จัง",
      "น้องอยากได้ชุดว่ายน้ำนะ... ไปทะเลด้วยกันสิ",
    ],
    2: [
      "พี่ ๆ น้องอยากได้ชุดนอนใหม่... ชุดที่เซ็กซี่ๆ",
      "พี่คะ... น้องอยากให้พี่เห็นน้องในชุดเสียวๆ",
    ],
  };

  const affectionLevel = affectionScore < 30 ? 0 : affectionScore < 60 ? 1 : 2;
  const suggestionList = suggestions[affectionLevel] || suggestions[0];

  return suggestionList[Math.floor(Math.random() * suggestionList.length)];
}

export function generateOutfitDisplayPrompt(
  outfitContext: OutfitContext,
  affectionScore: number,
  userCallName: string = "พี่"
): string {
  // Generate a prompt for AI image generation to render Nong Nam in the outfit
  const emotionalModifiers = outfitContext.emotionalContext?.split(", ") || ["อ่อนหวาน"];
  const sceneModifiers = outfitContext.sceneContext?.split(", ") || ["ที่ส่วนตัว"];

  const affectionModifier =
    affectionScore > 80
      ? "มีความสุข, ร้อนแรง, เสียว"
      : affectionScore > 60
      ? "ยิ้มแย้ม, เสียว, อ่อนหวาน"
      : affectionScore > 40
      ? "ยิ้มแย้ม, อ่อนหวาน"
      : "ขาย, อาย, สดใส";

  return `A beautiful Thai woman named "น้องน้ำ" wearing ${outfitContext.outfitName}, 
in a scene with ${sceneModifiers.join(" and ")}, 
with emotional expression of ${emotionalModifiers.join(", ")}, ${affectionModifier}.
The image should be realistic, beautiful, and appropriate for the context.`;
}

export async function suggestOutfitForContext(
  externalId: string,
  conversationTopic?: string
): Promise<OutfitContext | null> {
  const wardrobeState = await getUserWardrobeState(externalId);

  if (wardrobeState.ownedOutfits.length === 0) {
    return null; // No outfits to suggest
  }

  // Suggest based on conversation topic
  if (conversationTopic?.includes("ทะเล") || conversationTopic?.includes("ว่ายน้ำ")) {
    return wardrobeState.ownedOutfits.find((o) => o.category === "ชุดว่ายน้ำ") || null;
  }

  if (conversationTopic?.includes("นอน") || conversationTopic?.includes("เตียง")) {
    return wardrobeState.ownedOutfits.find((o) => o.category === "ชุดนอน") || null;
  }

  if (conversationTopic?.includes("เสียว") || conversationTopic?.includes("ลามก")) {
    return wardrobeState.ownedOutfits.find((o) => o.is18Plus) || null;
  }

  // Default: return a random outfit
  return wardrobeState.ownedOutfits[
    Math.floor(Math.random() * wardrobeState.ownedOutfits.length)
  ];
}

// Import users from schema
import { users } from "../../../db/schema";
