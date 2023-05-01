import { useCallback, useState } from "react";

import { useAudio } from "./playAudio";
import { IGNORED_MESSAGES } from "./consts";
import { cleanPrefixSuffix } from "./messages";
import { type PromptQueueItem, useTedStore } from "./ted";

export function useAskTed() {
  const { isTedProcessing, setIsTedProcessing } = useTedStore((state) => ({
    isTedProcessing: state.isTedProcessing,
    setIsTedProcessing: state.setIsTedProcessing,
  }));
  const [tedResponse, setTedResponse] = useState<string>();

  const { play, pause } = useAudio();

  const sayIt = useCallback(
    async (message: string) => {
      const response = await fetch("/api/googleTextToSpeech", {
        method: "POST",
        body: JSON.stringify({
          message: message.trim(),
        }),
      });

      const audioBlob = await response.blob();

      await play(audioBlob);
    },
    [play]
  );

  const askTed = useCallback(
    async (prompt: PromptQueueItem) => {
      if (isTedProcessing || !prompt.message) {
        console.warn("Ted is processing, or the message is empty");
      }

      setIsTedProcessing(true);

      const tedResponse = await fetch("/api/askTed", {
        method: "POST",
        body: JSON.stringify({
          user: prompt?.authorName,
          type: prompt.questionType,
          message: prompt.message.trim(),
        }),
      });

      const tedData = (await tedResponse.json()) as
        | { error: string }
        | { message: string };

      if ("message" in tedData) {
        if (prompt.readTheQuestion) {
          const sanitizedMessage = cleanPrefixSuffix(prompt.message);

          await sayIt(sanitizedMessage);
        }

        const isIgnoredMessage = tedData.message.match(
          new RegExp(IGNORED_MESSAGES.join("|"), "gi")
        );

        // Ignore unprocessed questions
        if (!isIgnoredMessage) {
          setTedResponse(tedData.message);
          await sayIt(tedData.message);
        }
      } else {
        await sayIt("I don't wanna talk about that!");
        console.error("Could not play the sound.");
      }

      setIsTedProcessing(false);
    },
    [isTedProcessing, sayIt, setIsTedProcessing]
  );

  return {
    askTed,
    pause,
    tedResponse,
  };
}
