/* eslint-disable @typescript-eslint/no-misused-promises */
import { useRef } from "react";

export function useAudio() {
  const audio = useRef<HTMLAudioElement | undefined>(
    typeof Audio !== "undefined" ? new Audio("") : undefined
  );

  const play = (audioBlob: Blob) => {
    return new Promise(async (resolve) => {
      const url = window.URL.createObjectURL(audioBlob);

      if (audio.current) {
        const output = await getOutputs();

        audio.current.src = url;
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          audio.current.setSinkId(output?.deviceId);
        } catch (err) {
          console.error("Set sing fail", err);
        }

        audio.current
          .play()
          .catch((err) => console.error("Audio play failed.", err));
      }

      const onAudioEnded = (event: Event) => {
        resolve(event);

        audio.current?.removeEventListener("ended", onAudioEnded);
      };

      audio.current?.addEventListener("ended", onAudioEnded);
    });
  };

  const pause = () => {
    audio.current?.pause();
  };

  async function getOutputs() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const outputs = devices.filter(({ kind }) => kind === "audiooutput");

    return outputs.find(({ label }) => label.includes("Virtual Speaker"));
  }

  return { play, pause };
}
