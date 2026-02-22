import { describe, expect, it } from "vitest";

import * as ChatComponents from "@/app/dashboard/chat/_components";

describe("chat components index exports", () => {
  it("exports core chat building blocks", () => {
    expect(ChatComponents.ChatSidebar).toBeDefined();
    expect(ChatComponents.ChatInput).toBeDefined();
    expect(ChatComponents.ChatMessagesArea).toBeDefined();
    expect(ChatComponents.ChatMessageBubble).toBeDefined();
    expect(ChatComponents.AudioPlayer).toBeDefined();
    expect(ChatComponents.NewSessionDialog).toBeDefined();
    expect(ChatComponents.EmptyState).toBeDefined();
    expect(ChatComponents.TypingIndicator).toBeDefined();
    expect(ChatComponents.VoiceInput).toBeDefined();
  });
});
