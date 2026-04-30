# Wardrobe and Catalog Database Schema Design

This document outlines the proposed database schema for implementing the "Wardrobe System" and "Proactive Shopping" features for Nong Nam AI. The design aims to support a dynamic outfitting system, allowing users to purchase and unlock new outfits, and for Nong Nam to suggest or wear these outfits based on context and affection levels.

## 1. `clothes_catalog` Table

This table will store information about all available clothing items that can be purchased or unlocked. Each entry represents a unique outfit.

| Column Name       | Data Type           | Constraints           | Description                                                               |
|-------------------|---------------------|-----------------------|---------------------------------------------------------------------------|
| `id`              | `UUID` / `VARCHAR(36)` | `PRIMARY KEY`, `NOT NULL` | Unique identifier for the clothing item.                                  |
| `name`            | `VARCHAR(255)`      | `NOT NULL`            | Human-readable name of the outfit (e.g., "ชุดว่ายน้ำทูพีซสีแดง").       |
| `description`     | `TEXT`              | `NULLABLE`            | Detailed description of the outfit, including its style and appeal.       |
| `category`        | `VARCHAR(50)`       | `NOT NULL`            | Category of the outfit (e.g., "ชุดว่ายน้ำ", "ชุดนอน", "ชุดเซ็กซี่"). |
| `image_url_base`  | `VARCHAR(255)`      | `NOT NULL`            | URL to the base image of the outfit (e.g., transparent PNG of the clothes itself). |
| `image_url_preview` | `VARCHAR(255)`      | `NULLABLE`            | URL to a preview image (e.g., on a generic model or blurred background). |
| `price_diamonds`  | `INTEGER`           | `NOT NULL`, `DEFAULT 0` | Cost of the outfit in "diamonds" (in-app currency).                     |
| `price_usd`       | `DECIMAL(10, 2)`    | `NULLABLE`            | Direct purchase price in USD (if applicable).                             |
| `is_18_plus`      | `BOOLEAN`           | `NOT NULL`, `DEFAULT FALSE` | Flag indicating if the outfit is explicit/18+.                            |
| `unlock_condition`| `TEXT`              | `NULLABLE`            | Conditions for unlocking (e.g., "Affection Score > 70").                  |
| `created_at`      | `TIMESTAMP`         | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Timestamp when the record was created.                                    |
| `updated_at`      | `TIMESTAMP`         | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Timestamp when the record was last updated.                               |

## 2. `user_wardrobe` Table

This table will track which clothing items each user has purchased or unlocked. It represents the user's personal collection of outfits.

| Column Name       | Data Type           | Constraints           | Description                                                               |
|-------------------|---------------------|-----------------------|---------------------------------------------------------------------------|
| `id`              | `UUID` / `VARCHAR(36)` | `PRIMARY KEY`, `NOT NULL` | Unique identifier for the wardrobe entry.                                 |
| `user_id`         | `VARCHAR(255)`      | `NOT NULL`, `FOREIGN KEY` | Reference to the `users` table (or `externalId` from `DeepMemory`).       |
| `outfit_id`       | `UUID` / `VARCHAR(36)` | `NOT NULL`, `FOREIGN KEY` | Reference to the `clothes_catalog` table.                                 |
| `is_owned`        | `BOOLEAN`           | `NOT NULL`, `DEFAULT FALSE` | Flag indicating if the user owns this outfit.                             |
| `is_equipped`     | `BOOLEAN`           | `NOT NULL`, `DEFAULT FALSE` | Flag indicating if Nong Nam is currently "wearing" this outfit.           |
| `purchased_at`    | `TIMESTAMP`         | `NULLABLE`            | Timestamp when the outfit was purchased/unlocked.                         |
| `equipped_at`     | `TIMESTAMP`         | `NULLABLE`            | Timestamp when the outfit was last equipped.                              |

## 3. `users` Table (Update)

The existing `users` table (or the `DeepMemory` structure) will need to be updated to include a `diamonds` (in-app currency) balance.

| Column Name       | Data Type           | Constraints           | Description                                                               |
|-------------------|---------------------|-----------------------|---------------------------------------------------------------------------|
| `diamonds`        | `INTEGER`           | `NOT NULL`, `DEFAULT 0` | User's current balance of in-app currency.                                |

## Relationships

*   `user_wardrobe.user_id` -> `users.id` (or `DeepMemory.user_id`)
*   `user_wardrobe.outfit_id` -> `clothes_catalog.id`

## Future Considerations

*   **Image Generation Integration**: The `image_url_base` will be used as input for an AI image generation service (e.g., Stable Diffusion, DALL-E) to dynamically render Nong Nam wearing the selected outfit in a relevant scene.
*   **Scene Context**: The `category` of the outfit (e.g., "ชุดว่ายน้ำ") can inform the AI to generate a suitable background (e.g., "ทะเล" for a swimsuit).
*   **Affection-based Unlocks**: `unlock_condition` allows for outfits to be unlocked based on the user's `affectionScore`.

This schema provides a robust foundation for the dynamic wardrobe and shopping system, enabling both enhanced user experience and monetization opportunities. The next step will be to implement these tables using Drizzle ORM and update the `persistentMemoryManager` to interact with them.
