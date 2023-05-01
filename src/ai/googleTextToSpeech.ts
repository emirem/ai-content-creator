import textToSpeech from "@google-cloud/text-to-speech";

import { env } from "../env.mjs";

const client = new textToSpeech.TextToSpeechClient({
  credentials: {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY,
  },
});

export async function googleTextToSpeech(message: string) {
  const request = {
    input: { text: message },
    audioConfig: {
      audioEncoding: 2,
      pitch: 6.4, // -6 for deeper voice
      speakingRate: 1,
    },
    voice: { languageCode: "en-US", name: "en-US-Neural2-I" },
  };

  const [response] = await client.synthesizeSpeech(request);

  if (response.audioContent) {
    return response.audioContent;
  }
}
