import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type TwitchMessage, useTmi } from "~/util/tmi";
import { constructQuestionPrompt } from "~/util/messages";
import { getRandomMessageFromChat } from "~/util/twitchMessageList";
import { TWEET_URL_PATTERN } from "~/util/twitter";

const CHAT_POLL_INTERVAL = 20000;
const MESSAGES_RENDER_LIMIT = 20;

type Props = {
  onMessageClick: (message: string, username: string) => void;
};

export function TwitchMessageList({ onMessageClick }: Props) {
  const { messages } = useTmi();
  const lastLIRef = useRef<HTMLLIElement>(null);
  const [lastMessagePollTime, setLastMessagePollTime] = useState<Date>(
    new Date()
  );
  const [snapshot, setSnapshot] = useState<TwitchMessage[] | undefined>();
  const renderedMessages = useMemo(() => {
    if (snapshot) {
      return snapshot;
    }

    return messages.slice(messages.length - MESSAGES_RENDER_LIMIT);
  }, [messages, snapshot]);

  const _onMessageClick = useCallback(
    (tMessage: TwitchMessage) => {
      let message = "";
      if (tMessage.message.match(TWEET_URL_PATTERN)) {
        message = tMessage.message;
      } else {
        message = constructQuestionPrompt(
          tMessage.username || "Chatter",
          tMessage.message
        );
      }

      onMessageClick(message, tMessage.username || "Chatter");
    },
    [onMessageClick]
  );

  const onListMouseEnter = () => {
    setSnapshot(messages.slice(messages.length - MESSAGES_RENDER_LIMIT));
  };

  const onListMouseLeave = () => {
    setSnapshot(undefined);
  };

  useEffect(() => {
    if (!snapshot) {
      lastLIRef.current?.scrollIntoView();
    }
  }, [lastLIRef, messages.length, snapshot]);

  // Random message poll every CHAT_POLL_INTERVAL
  useEffect(() => {
    if (
      lastMessagePollTime &&
      new Date().getTime() - lastMessagePollTime.getTime() > CHAT_POLL_INTERVAL
    ) {
      setLastMessagePollTime(new Date());
      const randomMsg = getRandomMessageFromChat(renderedMessages);

      if (randomMsg) {
        _onMessageClick(randomMsg);
      }
    }
  }, [onMessageClick, _onMessageClick, lastMessagePollTime, renderedMessages]);

  return (
    <ul
      onMouseEnter={onListMouseEnter}
      onMouseLeave={onListMouseLeave}
      className="custom-scrollbar -ml-2 mt-2 max-h-96 overflow-y-auto overflow-x-hidden pr-2"
    >
      {renderedMessages.map((renderedMessage, idx) => (
        <li
          key={idx}
          onClick={() => _onMessageClick(renderedMessage)}
          className={`my-2 cursor-pointer overflow-hidden text-ellipsis border-t border-slate-900 bg-[#15162c] p-2 text-lg leading-loose hover:bg-green-600`}
        >
          <b>{renderedMessage.username}</b>: {renderedMessage.message}
        </li>
      ))}
      <li ref={lastLIRef}></li>
    </ul>
  );
}
