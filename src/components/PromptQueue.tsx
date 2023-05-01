import { useCallback, useEffect, useState } from "react";
import { type PromptQueueItem, useTedStore } from "~/util/ted";

import { Play, Stop } from "./icons";
import { PromptQueueListItem } from "./PromptQueueItem";

type Props = {
  askTed: (prompt: PromptQueueItem) => Promise<void>;
  onPromptQueueItemClick: (
    idx: number,
    status: PromptQueueItem["status"]
  ) => void;
};

export const PROMPT_QUEUE_PROCESS_PAUSE = 20000; // 20s

export function PromptQueue({ askTed, onPromptQueueItemClick }: Props) {
  const { promptQueue, isTedProcessing, updatePromptQueueItem } = useTedStore(
    (state) => state
  );
  const [, setTimeoutId] = useState<NodeJS.Timer>();
  const [allowQueueProcessing, setAllowQueueProcessing] = useState(false);
  const [lastMessageProcessTime, setLastMessageProcessTime] = useState<Date>(
    new Date()
  );

  const processQueue = useCallback(async () => {
    console.info("Processing queue...");

    const queue = [...promptQueue];
    const promptItemIdx = promptQueue.findIndex(
      ({ status }) => status === "new"
    );

    if (promptItemIdx > -1) {
      const promptItem = queue[promptItemIdx];

      if (promptItem) {
        promptItem.status = "processing";
        updatePromptQueueItem(promptItem, promptItemIdx);
        setLastMessageProcessTime(new Date());

        await askTed(promptItem);

        promptItem.status = "processed";
        updatePromptQueueItem(promptItem, promptItemIdx);
      }
    }
  }, [askTed, updatePromptQueueItem, promptQueue]);

  // Trigger processQueue
  useEffect(() => {
    const newMessages = promptQueue.filter(({ status }) => status === "new");

    if (newMessages.length && allowQueueProcessing && !isTedProcessing) {
      const diff = new Date().getTime() - lastMessageProcessTime.getTime();
      const timeout = PROMPT_QUEUE_PROCESS_PAUSE - diff;

      // Turn mic on after the pause
      const id = setTimeout(() => {
        processQueue().catch(() => console.error("processQueue failed."));
      }, timeout);

      // Clear out prev timeout
      setTimeoutId((prev) => {
        if (prev) {
          clearTimeout(prev);
        }

        return id;
      });
    }
  }, [
    allowQueueProcessing,
    lastMessageProcessTime,
    isTedProcessing,
    promptQueue,
    processQueue,
  ]);

  return (
    <div className="flex-1">
      <h2 className="mt-2 text-center text-sm uppercase">Prompt queue</h2>
      <div className="mt-2 flex flex-row items-center justify-center">
        <button
          disabled={allowQueueProcessing}
          onClick={() => setAllowQueueProcessing(true)}
          className={`flex justify-center p-2 ${
            allowQueueProcessing ? "bg-green-900" : "bg-green-600"
          }`}
        >
          <Play />
        </button>
        <button
          disabled={!allowQueueProcessing}
          onClick={() => setAllowQueueProcessing(false)}
          className={`ml-2 flex justify-center bg-rose-700 p-2 ${
            allowQueueProcessing ? "bg-rose-700" : "bg-rose-900"
          }`}
        >
          <Stop />
        </button>
      </div>
      <ul className="custom-scrollbar max-h-72 flex-1 overflow-y-auto overflow-x-hidden pr-2">
        {promptQueue.map((pItem, idx) => (
          <PromptQueueListItem
            idx={idx}
            item={pItem}
            key={`${pItem.status}-${idx}`}
            onItemUpdate={updatePromptQueueItem}
            onPromptQueueItemClick={() =>
              onPromptQueueItemClick(idx, pItem.status)
            }
          />
        ))}
      </ul>
    </div>
  );
}
