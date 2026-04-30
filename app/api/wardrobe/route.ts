import { NextRequest, NextResponse } from "next/server";
import { DeepMemory } from "../utils/memoryManager";
import { getUserMemoryFromDB, saveUserMemoryToDB, addDiamondsToUser, deductDiamondsFromUser } from "../utils/persistentMemoryManager";
import { getUserWardrobeState, suggestOutfitForContext } from "../utils/wardrobeManager";

export const runtime = "nodejs";

// Mock database functions - replace with actual database calls when database is properly configured
async function purchaseOutfitFromCatalog(externalId: string, outfitId: string, price: number): Promise<boolean> {
  // TODO: Implement actual database purchase logic
  // This should:
  // 1. Check if user has enough diamonds
  // 2. Deduct diamonds from user
  // 3. Add outfit to user's wardrobe
  // 4. Save to database
  return true;
}

async function equipOutfit(externalId: string, outfitId: string): Promise<boolean> {
  // TODO: Implement actual database equip logic
  // This should:
  // 1. Update user's equipped outfit
  // 2. Save to database
  return true;
}

async function getCatalogOutfits(): Promise<any[]> {
  // TODO: Implement actual database fetch
  // Return all available outfits from catalog
  return [
    {
      id: "outfit_1",
      name: "ชุดว่ายน้ำสีฟ้า",
      category: "ชุดว่ายน้ำ",
      price: 100,
      image_url_base: "https://example.com/swimsuit_blue.png",
      is_18_plus: false,
    },
    {
      id: "outfit_2",
      name: "ชุดนอนสีชมพู",
      category: "ชุดนอน",
      price: 150,
      image_url_base: "https://example.com/sleepwear_pink.png",
      is_18_plus: true,
    },
    {
      id: "outfit_3",
      name: "ชุดเซ็กซี่สีแดง",
      category: "ชุดเซ็กซี่",
      price: 200,
      image_url_base: "https://example.com/sexy_red.png",
      is_18_plus: true,
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const { action, externalId, outfitId, diamonds } = await req.json();

    if (!externalId) {
      return NextResponse.json({ error: "Missing externalId" }, { status: 400 });
    }

    // Get current user memory
    let userMemory = await getUserMemoryFromDB(externalId);
    if (!userMemory) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "purchase":
        if (!outfitId) {
          return NextResponse.json({ error: "Missing outfitId" }, { status: 400 });
        }

        // Get catalog to find outfit price
        const catalog = await getCatalogOutfits();
        const outfit = catalog.find((o) => o.id === outfitId);

        if (!outfit) {
          return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
        }

        // Check if user has enough diamonds
        const currentDiamonds = userMemory.diamonds || 0;
        if (currentDiamonds < outfit.price) {
          return NextResponse.json(
            {
              error: "Insufficient diamonds",
              required: outfit.price,
              current: currentDiamonds,
              shortfall: outfit.price - currentDiamonds,
            },
            { status: 400 }
          );
        }

        // Deduct diamonds and purchase outfit
        await deductDiamondsFromUser(externalId, outfit.price);
        await purchaseOutfitFromCatalog(externalId, outfitId, outfit.price);

        // Update memory
        userMemory.diamonds = (userMemory.diamonds || 0) - outfit.price;
        await saveUserMemoryToDB(externalId, userMemory);

        return NextResponse.json({
          success: true,
          message: `ซื้อ ${outfit.name} สำเร็จ`,
          outfit: outfit,
          remainingDiamonds: userMemory.diamonds,
        });

      case "equip":
        if (!outfitId) {
          return NextResponse.json({ error: "Missing outfitId" }, { status: 400 });
        }

        // Equip outfit
        await equipOutfit(externalId, outfitId);

        // Update memory
        userMemory.equippedOutfitId = outfitId;
        await saveUserMemoryToDB(externalId, userMemory);

        const wardrobeState = await getUserWardrobeState(externalId);
        const equippedOutfit = wardrobeState.ownedOutfits.find((o) => o.outfitId === outfitId);

        return NextResponse.json({
          success: true,
          message: `สวมใส่ ${equippedOutfit?.outfitName} สำเร็จ`,
          equippedOutfit: equippedOutfit,
        });

      case "add_diamonds":
        if (!diamonds || diamonds <= 0) {
          return NextResponse.json({ error: "Invalid diamond amount" }, { status: 400 });
        }

        // Add diamonds
        await addDiamondsToUser(externalId, diamonds);

        // Update memory
        userMemory.diamonds = (userMemory.diamonds || 0) + diamonds;
        await saveUserMemoryToDB(externalId, userMemory);

        return NextResponse.json({
          success: true,
          message: `เพิ่มเพชร ${diamonds} เม็ด สำเร็จ`,
          totalDiamonds: userMemory.diamonds,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Wardrobe API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const externalId = searchParams.get("externalId");

    if (!externalId && action !== "catalog") {
      return NextResponse.json({ error: "Missing externalId" }, { status: 400 });
    }

    switch (action) {
      case "catalog":
        const catalog = await getCatalogOutfits();
        return NextResponse.json({
          success: true,
          outfits: catalog,
        });

      case "inventory":
        const wardrobeState = await getUserWardrobeState(externalId!);
        const userMemory = await getUserMemoryFromDB(externalId!);

        return NextResponse.json({
          success: true,
          currentOutfit: wardrobeState.currentOutfitContext,
          ownedOutfits: wardrobeState.ownedOutfits,
          totalOutfits: wardrobeState.totalOutfits,
          diamonds: userMemory?.diamonds || 0,
        });

      case "suggest":
        const topic = searchParams.get("topic");
        const suggestedOutfit = await suggestOutfitForContext(externalId!, topic || undefined);

        return NextResponse.json({
          success: true,
          suggestedOutfit: suggestedOutfit,
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Wardrobe GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
