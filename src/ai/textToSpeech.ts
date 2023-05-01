// import { env } from "~/env.mjs";

const ELEVEN_LABS_BASE_URL = "https://api.elevenlabs.io";
const GAMER_VOICE_ID = "bEciwOZ89I4W0OQ8a8Ql";

export async function textToSpeech(message: string) {
  return await fetch(
    `${ELEVEN_LABS_BASE_URL}/v1/text-to-speech/${GAMER_VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": "", // env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY,
      },
      body: JSON.stringify({
        text: message,
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.9,
        },
      }),
    }
  );
}
