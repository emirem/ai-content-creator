import { SupabaseClient } from "@supabase/supabase-js";
import type { ChatCompletionRequestMessage } from "openai";

import { env } from "~/env.mjs";

export async function getModelContext(userId: string, selectQuery = "*") {
  try {
    const sbClient = new SupabaseClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        db: {
          schema: "next_auth",
        },
      }
    );

    const { data } = await sbClient
      .from("model_context")
      .select(selectQuery)
      .eq("userId", userId)
      .order("order");

    return data as unknown as ChatCompletionRequestMessage[];
  } catch (err) {
    console.error(err);
    return [];
  }
}
