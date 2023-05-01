import { useEffect, useState } from "react";
import { constructQuestionPrompt } from "./messages";
import { useTedStore } from "./ted";

export let recognition: SpeechRecognition | undefined;

if (typeof window !== "undefined") {
  const { webkitSpeechRecognition } = window;
  const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
}

export function useSpeechRecognition() {
  const [isMicOn, setIsMicOn] = useState(false);
  const { addToPromptQueue } = useTedStore((state) => ({
    addToPromptQueue: state.addToPromptQueue,
  }));

  const _onSpeechResult = (event: SpeechRecognitionEvent) => {
    const result = event.results.item(event.results.length - 1);
    const message = result[0]?.transcript.trim();
    const confidence = result[0]?.confidence || 0;

    if (confidence < 0.8) {
      console.warn("Confidence is too low.", confidence);
      return;
    }

    if (message) {
      addToPromptQueue({
        status: "new",
        readTheQuestion: false,
        authorName: "Recurrsed",
        message: constructQuestionPrompt("Recurrsed", message),
      });
    }

    setIsMicOn(false);
    recognition?.stop();
  };

  const onToggleSpeechRecognition = () => {
    setIsMicOn((prev) => {
      if (!prev) {
        recognition?.start();
      } else {
        recognition?.stop();
      }

      return !prev;
    });
  };

  // Speech listeners
  useEffect(() => {
    if (recognition) {
      recognition.addEventListener("result", _onSpeechResult);

      return () => {
        recognition?.removeEventListener("result", _onSpeechResult);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isMicOn, onToggleSpeechRecognition };
}
