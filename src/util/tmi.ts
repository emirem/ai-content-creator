import { useCallback, useEffect, useState } from "react";
import tmi, {
  type AnonSubGiftUserstate,
  type ChatUserstate,
  type SubMethods,
  type SubUserstate,
  type Userstate,
} from "tmi.js";
import { env } from "../env.mjs";
import { type PromptQueueItem, useTedStore } from "./ted";

const client = new tmi.Client({
  channels: ["recurrsed"],
  identity: {
    username: env.NEXT_PUBLIC_TWITCH_USERNAME,
    password: env.NEXT_PUBLIC_TWITCH_PASSWORD,
  },
});

client.connect().catch((err) => console.error("Failed to connect", err));

export type TwitchMessage = {
  message: string;
  username: ChatUserstate["username"];
};

// const POSSIBLE_ACTIONS = ["The sub-train has ended"];

async function handleCommands(
  command: string,
  message: string,
  username: string
) {
  if (command === "!tt") {
    try {
      await fetch("/api/saveTwitchKnowledge", {
        method: "POST",
        body: JSON.stringify({ message, username }),
      });
    } catch (err) {
      console.error(err);
    }
  }
}

function constructMsg(message: string): PromptQueueItem {
  return {
    message,
    status: "new",
    questionType: "default",
    readTheQuestion: true,
  };
}

export function useTmi() {
  const { addToPromptQueue } = useTedStore((state) => ({
    addToPromptQueue: state.addToPromptQueue,
  }));
  const [messages, setMessages] = useState<TwitchMessage[]>([]);

  const onMessage = (
    channel: string,
    userState: ChatUserstate,
    message: string,
    self: boolean
  ) => {
    if (self || userState.username === "streamelements") return;

    if (message.startsWith("!")) {
      const breakPoint = message.indexOf(" ");
      const command = message.substring(0, breakPoint);
      const msg = message.substring(breakPoint).trim();

      // eslint-disable-next-line
      handleCommands(command, msg, userState.username || "Unknown User");
    }

    setMessages((prev) => {
      return [...prev, { message, username: userState.username }];
    });
  };

  const onAction = useCallback(
    (channel: string, user: Userstate, message: string, self: boolean) => {
      if (self) return;

      console.log("Action", message, user);
    },
    []
  );

  const onCheer = useCallback(
    (channel: string, user: ChatUserstate, message: string) => {
      console.log("cheer", message);
      addToPromptQueue(
        constructMsg(
          `Thank ${
            user.username || "Unknown user"
          } for giving you money. This was his message: ${message}`
        )
      );
    },
    [addToPromptQueue]
  );

  const onSubscription = useCallback(
    (
      channel: string,
      username: string,
      methods: SubMethods,
      message: string
      // userState: SubUserstate
    ) => {
      console.log("subscription", message, username, methods);
      addToPromptQueue(
        constructMsg(
          `Thank ${username} for a brand new subscription to your stream.`
        )
      );
    },
    [addToPromptQueue]
  );

  const onGiftSub = useCallback(
    (
      channel: string,
      streakMonths: number,
      recipient: string,
      methods: SubMethods,
      user: AnonSubGiftUserstate
    ) => {
      console.log("Gift sub", { streakMonths, recipient, user });
    },
    []
  );

  const onResub = (
    channel: string,
    username: string,
    months: number,
    message: string,
    userState: SubUserstate,
    methods: SubMethods
  ) => {
    console.log("resub", { months, username, methods });
    let customMessage = "";

    if (!methods.prime) {
      customMessage = `Thank ${username} for the sub to your stream.`;
    }

    if (methods.prime && months === 0) {
      customMessage = `Thank ${username} for the Prime to your stream.`;
    }

    if (methods.prime && months > 0) {
      customMessage = `Thank ${username} for ${months}-month resub to your stream.`;
    }

    if (methods.plan === "2000") {
      customMessage = `Thank ${username} for Tier 2.`;
    }

    if (methods.plan === "3000") {
      customMessage = `Thank ${username} for Tier 3 sub to your stream`;
    }

    addToPromptQueue(constructMsg(customMessage));
  };

  useEffect(() => {
    if (client.listenerCount("message") < 1) {
      client.on("message", onMessage);
    }
    if (client.listenerCount("cheer") < 1) {
      client.on("cheer", onCheer);
    }
    if (client.listenerCount("action") < 1) {
      client.on("action", onAction);
    }
    if (client.listenerCount("subscription") < 1) {
      client.on("subscription", onSubscription);
    }
    if (client.listenerCount("anonsubgift") < 1) {
      client.on("anonsubgift", onGiftSub);
    }
    if (client.listenerCount("resub") < 1) {
      client.on("resub", onResub);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { messages };
}
