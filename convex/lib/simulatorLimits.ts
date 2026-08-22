import type { LlmMessage } from "./llm";

export const SIMULATOR_MAX_USER_TURNS_PER_SESSION = 25;
export const SIMULATOR_HOURLY_USER_MESSAGE_LIMIT = 40;
export const SIMULATOR_HOURLY_SESSION_LIMIT = 12;
export const SIMULATOR_MAX_HISTORY_TURNS = 16;
export const SIMULATOR_MAX_HISTORY_CHARS = 12_000;

export function limitSimulatorHistory(
  messages: LlmMessage[],
  maxTurns = SIMULATOR_MAX_HISTORY_TURNS,
  maxChars = SIMULATOR_MAX_HISTORY_CHARS
): LlmMessage[] {
  const selected: LlmMessage[] = [];
  let usedChars = 0;

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (selected.length >= maxTurns) break;
    const message = messages[index];
    if (!message) continue;
    if (usedChars + message.content.length > maxChars) break;
    selected.push(message);
    usedChars += message.content.length;
  }

  return selected.reverse();
}
