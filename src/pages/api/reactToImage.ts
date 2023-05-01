import { readFileSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { analyzeImage } from "~/ai/imageVision";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const img = readFileSync("public/test-2.jpg");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await analyzeImage(img);

  res.status(200);
  return res.send(JSON.stringify(data));
}
