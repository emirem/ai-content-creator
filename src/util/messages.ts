const MESSAGE_PREFIX = "says:";
const MESSAGE_SUFFIX =
  ". Keep your defined personality in mind, and respond to them.";

export function sanitizeMessageForRender(message: string) {
  return cleanPrefixSuffix(message);
}

export function constructQuestionPrompt(
  username: string,
  message: string,
  suffix = MESSAGE_SUFFIX
) {
  return `${username} ${MESSAGE_PREFIX} """${message.trim()}""" ${suffix}`;
}

export function cleanPrefixSuffix(message: string) {
  let msgStart = message.indexOf(MESSAGE_PREFIX);

  if (msgStart > -1) {
    msgStart += MESSAGE_PREFIX.length;
  }

  return message
    .substring(msgStart)
    .replace(MESSAGE_SUFFIX, "")
    .replace(/"""/g, "")
    .trim();
}
