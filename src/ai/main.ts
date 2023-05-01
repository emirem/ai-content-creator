import {
  type ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai";

import { env } from "../env.mjs";
import { SupabaseClient } from "@supabase/supabase-js";

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const MAX_MESSAGES_LENGTH = 16380; // 4096 tokens * 4 characters
const MAX_MESSAGE_HISTORY_COUNT = 10;
let conversationMemory: ChatCompletionRequestMessage[] = [];

function checkTokenLength(messages: ChatCompletionRequestMessage[]) {
  const all = messages.map(({ content }) => content).join().length;
  const problematic = messages
    .map(({ content }) => {
      const data: { len: number; content?: string } = {
        len: content.length,
      };

      data.content = content.substring(0, 50);

      return data;
    })
    .filter(({ len }) => len > 200);

  console.table(problematic);
  console.log("All messages character length", all);

  return all < MAX_MESSAGES_LENGTH;
}

export async function askTed(
  message: ChatCompletionRequestMessage,
  ctxData: ChatCompletionRequestMessage[]
) {
  if (!message) return;

  const messages = [
    ...ctxData,
    ...conversationMemory,
    message,
  ] as ChatCompletionRequestMessage[];

  if (checkTokenLength(messages)) {
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 700,
        frequency_penalty: 1.2,
        presence_penalty: 1.2,
        temperature: 1,
      });
      const responseSanitized = response.data.choices[0]?.message?.content;
      // const cleanMsg = cleanPrefixSuffix(responseSanitized || "");

      if (responseSanitized) {
        conversationMemory.push({ ...message, content: responseSanitized });
        conversationMemory.push({
          role: "assistant",
          content: responseSanitized,
        });
      }

      if (conversationMemory.length > MAX_MESSAGE_HISTORY_COUNT) {
        conversationMemory.slice(1);
      }

      return responseSanitized;
    } catch (err) {
      console.log(err);
    }
  } else {
    conversationMemory = [];
  }
}

async function transformMsgToVecor(message: string) {
  const resp = await openai.createEmbedding({
    input: message,
    model: "text-embedding-ada-002",
  });

  if (resp.status !== 200) {
    throw new Error("Failed to create embedding");
  }

  return resp.data.data[0]?.embedding;
}

export async function askTedKnowedgeBase(
  message: ChatCompletionRequestMessage,
  ctxData: ChatCompletionRequestMessage[]
) {
  if (!message) return;

  let embedding;

  try {
    embedding = await transformMsgToVecor(message.content);
  } catch (err) {
    console.error("Got the err", err);
    return;
  }

  const sbClient = new SupabaseClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data: pageSections } = (await sbClient.rpc("match_page_sections", {
    embedding,
    match_threshold: 0.7,
    match_count: 5,
    min_content_length: 30,
  })) as { data: { content: string }[] };
  let contextText = "";

  for (let i = 0; i < pageSections.length; i++) {
    const pageSection = pageSections[i];
    const content = pageSection?.content;

    // TODO: check how many tokens should be allowed
    // if (content.length >= 1500) {
    //   break;
    // }

    if (content) {
      contextText += `${content.trim()}\n---\n`;
    }
  }

  // Data in the DB not found
  if (contextText.length === 0) {
    return;
  }

  const knowledge: ChatCompletionRequestMessage = {
    role: "user",
    content: "",
  };

  knowledge.content = `
  Consider context bellow as the extension of your knowledge about the topic we are talking about. Use it to answer the question. If you don't know the answer, say "I don't know"
  Context:
  ${contextText}

  Quesion: """${message.content}"""
  `;

  const messages = [...ctxData, knowledge] as ChatCompletionRequestMessage[];

  if (checkTokenLength(messages)) {
    try {
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0301",
        messages,
      });
      const responseSanitized = response.data.choices[0]?.message?.content;

      return responseSanitized;
    } catch (err) {
      console.log(err);
      console.error((err as { message: string }).message);
    }
  }
}
