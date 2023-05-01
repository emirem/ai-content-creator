import { SupabaseClient } from "@supabase/supabase-js";
import type { ChatCompletionRequestMessage } from "openai";
import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "~/env.mjs";
import { authOptions } from "./auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

export type ModelContext = ChatCompletionRequestMessage & { userId: string };

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
    context: ChatCompletionRequestMessage[];
  };
  const { context } = bodyParased;

  if (!context) {
    res.status(500);
    return res.send(JSON.stringify({ error: "Fail. Ai Context missing." }));
  }

  const sbClient = new SupabaseClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      db: {
        schema: "next_auth",
      },
    }
  );

  const payload: ModelContext[] = context.map((item) => ({
    ...item,
    userId: session.user!.id,
  }));

  try {
    await sbClient.from("model_context").upsert(payload);

    res.status(200).send(JSON.stringify({ message: "Context updated." }));
  } catch (error) {
    res.send(JSON.stringify({ error }));
  }
}
