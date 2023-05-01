import { useEffect, useRef } from "react";

export function useMicInput(onAudioEnd: (audioBlob: Blob) => void) {
  const mediaRecorderRef = useRef<MediaRecorder>();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          sampleRate: 48000,
          sampleSize: 16,
          channelCount: 1,
        },
        video: false,
      })
      .then((stream) => {
        const options = {
          mimetype: "audio/webm;codecs=opus",
          audioBitsPerSecond: 48000,
        };
        let recordedChunks: Blob[] = [];
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.addEventListener("dataavailable", function (event) {
          if (event.data.size > 0) recordedChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", function () {
          const blob = new Blob(recordedChunks, {
            type: "audio/webm;codecs=opus",
          });

          recordedChunks = [];
          onAudioEnd(blob);
        });
      })
      .catch((error) => {
        if ((error as { name: string }).name === "PermissionDeniedError") {
          console.error(
            "You need to grant this page permission to access your camera and microphone."
          );
        } else {
          console.error(
            `getUserMedia error: ${(error as { name: string }).name}`,
            error
          );
        }
      });
  }, [onAudioEnd]);

  return { mediaRecorderRef };
}
