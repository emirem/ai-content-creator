// import { env } from "~/env.mjs";

export function analyzeImage(image: Buffer) {
  return fetch(
    "https://screen-react.cognitiveservices.azure.com/vision/v3.2/analyze?language=en",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        // "Ocp-Apim-Subscription-Key": env.VISION_KEY,
      },
      body: image,
    }
  ).then((resp) => resp.json());
}
