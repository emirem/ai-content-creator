import type { FC } from "react";

import { Reddit, Twitter, Youtube } from "./icons";
import type { AllowedPromptTypes } from "~/util/reactPrompt";

export type Props = {
  promptType: AllowedPromptTypes;
};

const socialIcons: Partial<Record<AllowedPromptTypes, FC>> = {
  twitter: Twitter,
  reddit: Reddit,
  youtube_comment: Youtube,
};

export function PromptTypeIcon({ promptType }: Props) {
  const TypeComonent = socialIcons[promptType];

  if (!TypeComonent) {
    return null;
  }

  return (
    <div className="absolute -top-5 -right-5 rounded-full bg-[#15162c] p-2 text-white shadow-md">
      <TypeComonent />
    </div>
  );
}
