import fs from "fs";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const bodyParased = JSON.parse(req.body as string) as {
    message: string;
    username: string;
  };
  const { message, username } = bodyParased;

  if (!message) {
    res.status(500);
    return res.send(JSON.stringify({ error: "Fail. Message missing." }));
  }

  fs.appendFileSync(
    `training/twitch_chat_knowledge`,
    ` ${username} from your Twitch chat thought you should know about this: ${message}\n`
  );

  res.status(200).send(JSON.stringify({ message: "Knowledge saved." }));
}
