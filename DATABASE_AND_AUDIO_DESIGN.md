# Database Schema Design for Persistent Memory & Audio/Voice Context Management

## 1. Persistent Long-term Memory Database Design

To ensure "น้องน้ำ" remembers everything about the user, a persistent database is crucial. Given the Next.js environment, a PostgreSQL database (e.g., via Supabase or a self-hosted solution) is a robust and scalable choice. Below is a proposed schema for a `users` table and a `memories` table, linked by `user_id`.

### 1.1 `users` Table Schema

This table will store basic user information and link to their detailed memories.

| Column Name      | Data Type | Constraints           | Description                                    |
|------------------|-----------|-----------------------|------------------------------------------------|
| `user_id`        | UUID      | PRIMARY KEY, NOT NULL | Unique identifier for each user                |
| `external_id`    | TEXT      | UNIQUE, NOT NULL      | ID from external authentication (e.g., Line ID)|
| `created_at`     | TIMESTAMP | DEFAULT NOW()         | Timestamp of user creation                     |
| `last_active_at` | TIMESTAMP | DEFAULT NOW()         | Last activity timestamp for proactive checks   |
| `affection_score`| INTEGER   | DEFAULT 0             | Score indicating user's affection level        |
| `relationship_status`| TEXT    | DEFAULT 'เริ่มต้น'     | Current relationship status with Nong Nam      |

### 1.2 `memories` Table Schema

This table will store the detailed `DeepMemory` for each user, allowing for flexible JSON storage for complex data types.

| Column Name      | Data Type | Constraints           | Description                                    |
|------------------|-----------|-----------------------|------------------------------------------------|
| `memory_id`      | UUID      | PRIMARY KEY, NOT NULL | Unique identifier for each memory entry        |
| `user_id`        | UUID      | FOREIGN KEY, NOT NULL | Links to the `users` table                     |
| `data`           | JSONB     | NOT NULL              | Stores the `DeepMemory` object as JSON         |
| `updated_at`     | TIMESTAMP | DEFAULT NOW()         | Timestamp of last memory update                |

### 1.3 `conversation_history` Table Schema

To track conversation flow and emotional context over time.

| Column Name      | Data Type | Constraints           | Description                                    |
|------------------|-----------|-----------------------|------------------------------------------------|
| `message_id`     | UUID      | PRIMARY KEY, NOT NULL | Unique identifier for each message             |
| `user_id`        | UUID      | FOREIGN KEY, NOT NULL | Links to the `users` table                     |
| `role`           | TEXT      | NOT NULL              | 'user' or 'assistant'                          |
| `content`        | TEXT      | NOT NULL              | Message content                                |
| `emotional_state`| TEXT      | NULLABLE              | Detected emotional state of the message        |
| `timestamp`      | TIMESTAMP | DEFAULT NOW()         | Timestamp of the message                       |

## 2. Audio/Voice Context Management Design

Integrating emotional voice responses requires a clear pipeline from emotional detection to TTS service integration and delivery.

### 2.1 Emotional State to Voice Parameter Mapping

The `emotionEngine.ts` will be enhanced to not only return a text response but also suggest an `emotional_tone` parameter for the TTS service.

| Detected Emotion | Suggested TTS Tone/Style | Example TTS Parameters (ElevenLabs-like) |
|------------------|--------------------------|------------------------------------------|
| `happy`          | Joyful, Playful          | `voice_id='...', model_id='...', emotion='joyful'` |
| `sad`            | Soft, Sympathetic        | `voice_id='...', model_id='...', emotion='sad'` |
| `angry`          | Firm, Scolding           | `voice_id='...', model_id='...', emotion='angry'` |
| `stressed`       | Calm, Reassuring         | `voice_id='...', model_id='...', emotion='calm'` |
| `romantic`       | Whispering, Seductive    | `voice_id='...', model_id='...', emotion='seductive'` |
| `flirty`         | Teasing, Playful         | `voice_id='...', model_id='...', emotion='flirty'` |
| `explicit`       | Moaning, Breathless      | `voice_id='...', model_id='...', emotion='moaning'` |
| `neutral`        | Standard, Conversational | `voice_id='...', model_id='...', emotion='neutral'` |

### 2.2 TTS Service Integration (Conceptual)

1.  **API Call**: After the AI generates a text `reply` and the `emotionEngine` determines the `emotional_tone`, the `route.ts` will make an API call to a TTS service (e.g., ElevenLabs).
2.  **Parameters**: The TTS API call will include the `reply` text, the `voice_id` (Nong Nam's specific voice), and the `emotional_tone`.
3.  **Audio Response**: The TTS service will return an audio file (e.g., MP3) or a URL to the audio file.
4.  **Delivery to User**: The `route.ts` will then send this audio file/URL back to the client (frontend) along with the text reply.

### 2.3 Frontend Integration (Conceptual)

- The frontend will receive both the text reply and the audio file/URL.
- It will play the audio automatically, enhancing the immersive experience.
- A visual indicator (e.g., waveform, speaker icon) could show that audio is playing.

## 3. API Changes in `route.ts`

The `POST` handler in `app/api/chat/route.ts` will need to be updated to:

1.  **Fetch User Memory**: Retrieve `DeepMemory` from the database using `user_id`.
2.  **Update User Memory**: After processing the user's message, update `DeepMemory` and save it back to the database.
3.  **Call TTS Service**: Integrate the call to the TTS service based on the generated text and emotional tone.
4.  **Return Audio URL**: Include the audio file URL in the `NextResponse`.

This design lays the groundwork for a truly immersive and emotionally intelligent AI companion. The next step will be to implement these changes in the code. 
