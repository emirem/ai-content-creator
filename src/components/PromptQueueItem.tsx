import { type ChangeEvent, type MouseEvent, useState } from "react";

import { Checkmark, Pencil } from "./icons";
import { sanitizeMessageForRender } from "~/util/messages";
import type { PromptQueueItem } from "~/util/ted";

type Props = {
  idx: number;
  item: PromptQueueItem;
  onItemUpdate: (item: PromptQueueItem, idx: number) => void;
  onPromptQueueItemClick: (event: MouseEvent<HTMLSpanElement>) => void;
};

export function PromptQueueListItem({
  idx,
  item,
  onItemUpdate,
  onPromptQueueItemClick,
}: Props) {
  const [promptText, setPromptText] = useState<PromptQueueItem["message"]>(
    item.message
  );

  const onEditPromptItemClick = (idx: number) => {
    // Confirm triggered
    if (item.status === "editing") {
      onItemUpdate({ ...item, message: promptText, status: "new" }, idx);
    } else {
      // Edit new item triggered
      onItemUpdate({ ...item, status: "editing" }, idx);
    }
  };

  const onPromptItemMessageChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (item.status !== "editing") return;

    setPromptText(event.target.value);
  };

  return (
    <li
      className={`my-2 flex cursor-pointer flex-row items-center border-t border-slate-900 bg-[#15162c] p-2 text-lg leading-loose ${
        item.status === "processed"
          ? "opacity-50"
          : item.status === "processing"
          ? "bg-green-600"
          : ""
      } `}
    >
      <div className="flex-1">
        {item.status === "editing" ? (
          <textarea
            value={promptText}
            onChange={onPromptItemMessageChange}
            rows={Math.min(promptText.length / 28, 4)}
            className="custom-scrollbar w-full resize-none border-b border-slate-800 bg-transparent outline-none"
          ></textarea>
        ) : (
          <span
            onClick={onPromptQueueItemClick}
            className="block w-full select-none"
          >
            {sanitizeMessageForRender(item.message)}
          </span>
        )}
      </div>
      {(item.status === "editing" || item.status === "new") && (
        <button
          className="ml-5 p-2 hover:bg-[#21223a]"
          onClick={() => onEditPromptItemClick(idx)}
        >
          {item.status === "editing" ? <Checkmark /> : <Pencil />}
        </button>
      )}
    </li>
  );
}
