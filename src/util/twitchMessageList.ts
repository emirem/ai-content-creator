import type { TwitchMessage } from "./tmi";

const MIN_MESSAGE_LENGTH_FOR_POLL = 4;
const MAX_MESSAGE_LENGTH_FOR_POLL = 200;
// TODO: Maybe set a max limit for the number of messages
const perviouslyPickedMessages: string[] = [];

export function getRandomMessageFromChat(renderedMessages: TwitchMessage[]) {
  const randomMsg =
    renderedMessages[Math.floor(Math.random() * renderedMessages.length)];

  if (
    randomMsg &&
    randomMsg.message.length > MIN_MESSAGE_LENGTH_FOR_POLL &&
    randomMsg.message.length < MAX_MESSAGE_LENGTH_FOR_POLL &&
    !perviouslyPickedMessages.includes(randomMsg.message)
  ) {
    perviouslyPickedMessages.push(randomMsg.message);
    return randomMsg;
  }

  return null;
}
