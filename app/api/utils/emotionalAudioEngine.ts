/**
 * Emotional Audio Engine
 * Generates voice parameters and audio context for TTS (Text-to-Speech) services
 * Supports ElevenLabs and similar TTS APIs
 */

export interface AudioContext {
  voiceId: string; // Unique voice ID for Nong Nam
  emotionalTone: string; // Emotional tone (e.g., "whisper", "moan", "scold", "sulk")
  intensity: "subtle" | "moderate" | "intense" | "extreme"; // Intensity level
  breathingPattern: "normal" | "heavy" | "gasping" | "trembling"; // Breathing pattern
  voicePitch: "high" | "normal" | "low"; // Voice pitch
  speed: "slow" | "normal" | "fast"; // Speech speed
  audioEffects?: string[]; // Optional audio effects (e.g., ["echo", "reverb"])
}

/**
 * Map emotional state to audio parameters
 */
export function mapEmotionToAudio(emotion: string, affectionScore: number): AudioContext {
  const baseVoiceId = "nongnam_voice_001"; // Placeholder - replace with actual voice ID

  switch (emotion) {
    case "happy":
      return {
        voiceId: baseVoiceId,
        emotionalTone: "joyful",
        intensity: affectionScore > 60 ? "intense" : "moderate",
        breathingPattern: "normal",
        voicePitch: "high",
        speed: "normal",
      };

    case "sad":
      return {
        voiceId: baseVoiceId,
        emotionalTone: "sympathetic",
        intensity: "moderate",
        breathingPattern: "normal",
        voicePitch: "low",
        speed: "slow",
      };

    case "angry":
      return {
        voiceId: baseVoiceId,
        emotionalTone: "scolding",
        intensity: affectionScore > 70 ? "extreme" : "intense",
        breathingPattern: "heavy",
        voicePitch: "high",
        speed: "fast",
      };

    case "stressed":
      return {
        voiceId: baseVoiceId,
        emotionalTone: "calm",
        intensity: "subtle",
        breathingPattern: "normal",
        voicePitch: "normal",
        speed: "slow",
      };

    case "romantic":
      return {
        voiceId: baseVoiceId,
        emotionalTone: "seductive",
        intensity: affectionScore > 70 ? "intense" : "moderate",
        breathingPattern: affectionScore > 70 ? "gasping" : "normal",
        voicePitch: "normal",
        speed: "slow",
        audioEffects: ["soft_echo"],
      };

    case "flirty":
      return {
        voiceId: baseVoiceId,
        emotionalTone: "teasing",
        intensity: "moderate",
        breathingPattern: "normal",
        voicePitch: "high",
        speed: "normal",
      };

    case "explicit":
      return {
        voiceId: baseVoiceId,
        emotionalTone: "moaning",
        intensity: affectionScore > 80 ? "extreme" : "intense",
        breathingPattern: affectionScore > 80 ? "gasping" : "heavy",
        voicePitch: affectionScore > 80 ? "high" : "normal",
        speed: affectionScore > 80 ? "fast" : "normal",
        audioEffects: affectionScore > 80 ? ["breathy", "tremor"] : ["breathy"],
      };

    case "sulk":
      return {
        voiceId: baseVoiceId,
        emotionalTone: "pouting",
        intensity: "moderate",
        breathingPattern: "normal",
        voicePitch: "high",
        speed: "slow",
      };

    case "jealous":
      return {
        voiceId: baseVoiceId,
        emotionalTone: "possessive",
        intensity: affectionScore > 70 ? "intense" : "moderate",
        breathingPattern: "heavy",
        voicePitch: "normal",
        speed: "fast",
      };

    default:
      return {
        voiceId: baseVoiceId,
        emotionalTone: "neutral",
        intensity: "subtle",
        breathingPattern: "normal",
        voicePitch: "normal",
        speed: "normal",
      };
  }
}

/**
 * Generate audio context for ElevenLabs API
 */
export function generateElevenLabsAudioContext(audioContext: AudioContext): {
  voice_id: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
  };
  text_settings?: {
    emotion?: string;
    breathing?: string;
  };
} {
  const stabilityMap: { [key: string]: number } = {
    subtle: 0.9,
    moderate: 0.8,
    intense: 0.6,
    extreme: 0.4,
  };

  const similarityMap: { [key: string]: number } = {
    subtle: 0.6,
    moderate: 0.75,
    intense: 0.85,
    extreme: 0.95,
  };

  return {
    voice_id: audioContext.voiceId,
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: stabilityMap[audioContext.intensity] || 0.75,
      similarity_boost: similarityMap[audioContext.intensity] || 0.75,
    },
    text_settings: {
      emotion: audioContext.emotionalTone,
      breathing: audioContext.breathingPattern,
    },
  };
}

/**
 * Generate audio context for Google Cloud Text-to-Speech API
 */
export function generateGoogleCloudAudioContext(audioContext: AudioContext): {
  voice: {
    language_code: string;
    name: string;
  };
  audio_config: {
    audio_encoding: string;
    pitch: number;
    speaking_rate: number;
  };
} {
  const pitchMap: { [key: string]: number } = {
    high: 4.0,
    normal: 0.0,
    low: -4.0,
  };

  const speedMap: { [key: string]: number } = {
    slow: 0.7,
    normal: 1.0,
    fast: 1.3,
    variable: 1.0, // Will be handled separately
  };

  return {
    voice: {
      language_code: "th-TH",
      name: "th-TH-Neural2-A",
    },
    audio_config: {
      audio_encoding: "MP3",
      pitch: pitchMap[audioContext.voicePitch] || 0.0,
      speaking_rate: speedMap[audioContext.speed] || 1.0,
    },
  };
}

/**
 * Generate audio context for custom TTS service
 */
export function generateCustomAudioContext(audioContext: AudioContext): string {
  return JSON.stringify({
    voice_id: audioContext.voiceId,
    emotional_tone: audioContext.emotionalTone,
    intensity: audioContext.intensity,
    breathing_pattern: audioContext.breathingPattern,
    voice_pitch: audioContext.voicePitch,
    speed: audioContext.speed,
    audio_effects: audioContext.audioEffects || [],
  });
}

/**
 * Generate audio instructions for voice generation
 */
export function generateAudioInstructions(audioContext: AudioContext): string {
  let instructions = `Generate audio with the following characteristics:\n`;
  instructions += `- Emotional Tone: ${audioContext.emotionalTone}\n`;
  instructions += `- Intensity: ${audioContext.intensity}\n`;
  instructions += `- Breathing Pattern: ${audioContext.breathingPattern}\n`;
  instructions += `- Voice Pitch: ${audioContext.voicePitch}\n`;
  instructions += `- Speech Speed: ${audioContext.speed}\n`;

  if (audioContext.audioEffects && audioContext.audioEffects.length > 0) {
    instructions += `- Audio Effects: ${audioContext.audioEffects.join(", ")}\n`;
  }

  return instructions;
}

/**
 * Determine if audio should include moaning/breathing sounds
 */
export function shouldIncludeBreathingSounds(emotion: string, affectionScore: number): boolean {
  if (emotion === "explicit" && affectionScore > 70) return true;
  if (emotion === "romantic" && affectionScore > 60) return true;
  if (emotion === "flirty" && affectionScore > 50) return true;
  return false;
}

/**
 * Generate audio file name based on emotion and timestamp
 */
export function generateAudioFileName(emotion: string, userId: string): string {
  const timestamp = Date.now();
  return `nongnam_${userId}_${emotion}_${timestamp}.mp3`;
}
