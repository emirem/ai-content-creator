import type { NextApiRequest, NextApiResponse } from "next";

import { googleTextToSpeech } from "~/ai/googleTextToSpeech";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const message = (JSON.parse(req.body as string) as { message: string })
    .message;

  if (!message) {
    res.status(500);
    return res.send(JSON.stringify({ message: "Fail. Message missing." }));
  }

  const resp = await googleTextToSpeech(message);

  res.status(200);
  return res.send(resp);
}
