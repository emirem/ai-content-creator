import type { NextApiRequest, NextApiResponse } from "next";
import { googleSpeechToText } from "~/ai/googleSpeechToText";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body as string;

  if (!data) {
    return res
      .status(500)
      .send(JSON.stringify({ error: "Fail. Data missing." }));
  }

  try {
    const transcript = await googleSpeechToText(data);

    res.status(200).send(JSON.stringify({ transcript }));
  } catch (err) {
    console.error("Transcription failed", err);

    res.status(500).send(JSON.stringify({ error: "Transcription failed" }));
  }
}
