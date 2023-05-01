import { getServerSession } from "next-auth/next";
import type { ChatCompletionRequestMessage } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

import { authOptions } from "./auth/[...nextauth]";
import { askTed, askTedKnowedgeBase } from "~/ai/main";
import { getModelContext } from "~/util/modelContext";

export type QuestionType = "default" | "knowledge";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401);
    return res.send(JSON.stringify({ error: "Unauthorized." }));
  }

  if (!session.user?.id) {
    res.status(500);
    return res.send(JSON.stringify({ error: "User id missing." }));
  }

  const bodyParased = JSON.parse(req.body as string) as {
    message: string;
    type: QuestionType;
    user: string | undefined;
  };
  const { message, type, user } = bodyParased;

  if (!message) {
    res.status(500);
    return res.send(JSON.stringify({ message: "Fail. Message missing." }));
  }

  const ctxData = await getModelContext(session.user.id, "role, content");
  const msgForTed: ChatCompletionRequestMessage = {
    name: user,
    role: "user",
    content: message,
  };

  if (!ctxData.length) {
    res.status(500);
    return res.send(JSON.stringify({ message: "Context data missing." }));
  }

  if (type === "default") {
    const response = await askTed(msgForTed, ctxData);

    if (response) {
      res.status(200);
      return res.send({ message: response });
    }
  } else {
    const response = await askTedKnowedgeBase(msgForTed, ctxData);

    if (response) {
      res.status(200);
      return res.send({ message: response });
    }
  }

  res.status(500);
  return res.send({ error: "Model did not process the prompt." });
}
