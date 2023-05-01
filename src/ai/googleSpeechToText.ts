import speech from "@google-cloud/speech";

import { env } from "../env.mjs";

const client = new speech.SpeechClient({
  credentials: {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY,
  },
});

export async function googleSpeechToText(audioRecorded: string) {
  const request = {
    audio: {
      content: audioRecorded.replace("data:audio/webm;codecs=opus;base64,", ""),
    },
    config: {
      encoding: 9, // webm_opus
      sampleRateHertz: 48000,
      languageCode: "en-US",
      enableAutomaticPunctuation: true,
    },
  };

  const [response] = await client.recognize(request);

  const transcription = response.results
    ?.map(({ alternatives }) => {
      if (alternatives?.length) {
        return alternatives[0]?.transcript;
      }
      return null;
    })
    .filter(Boolean)
    .join("\n");

  return transcription;
}
