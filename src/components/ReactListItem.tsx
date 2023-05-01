import { type MouseEvent, useState } from "react";
import type { AllowedPromptTypes } from "~/util/reactPrompt";

import { Checkmark, Trash } from "./icons";
import { PromptTypeIcon } from "./PromptTypeIcon";

export function ReactListItem({
  text,
  type,
  authorName,
  isTedProcessing,
  onDeleteListItemClick,
  onApproveListItemClick,
}: {
  text: string;
  authorName: string;
  isTedProcessing: boolean;
  type: AllowedPromptTypes;
  onDeleteListItemClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onApproveListItemClick: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative my-2 flex cursor-pointer flex-row items-start border-t border-slate-900 bg-[#15162c] p-2 text-lg leading-loose text-white"
    >
      {isHovered && (
        <p className="absolute right-20 z-10 -translate-y-full translate-x-[102%] rounded-sm bg-[#15162c] p-2 shadow-lg">
          {text}
        </p>
      )}

      <PromptTypeIcon promptType={type} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <span
          title={text}
          className="block overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {text}
        </span>
        <small>by: {authorName}</small>
      </div>

      <div className="flex flex-col">
        <button
          disabled={isTedProcessing}
          onClick={onApproveListItemClick}
          className={`ml-5 p-2 hover:bg-[#21223a] ${
            isTedProcessing ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <Checkmark />
        </button>
        <button
          disabled={isTedProcessing}
          onClick={onDeleteListItemClick}
          className={`ml-5 p-2 hover:bg-[#21223a] ${
            isTedProcessing ? "cursor-not-allowed opacity-50" : ""
          }`}
        >
          <Trash />
        </button>
      </div>
    </li>
  );
}
