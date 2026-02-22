import { describe, expect, it, vi } from "vitest";

import {
  createChatSession,
  loadChatSession,
  loadChatSessions,
  sendAudioMessage,
  sendTextMessage,
  toggleFavorite,
} from "@/app/dashboard/chat/actions";

const { chatServiceMock } = vi.hoisted(() => ({
  chatServiceMock: {
    createSession: vi.fn(),
    sendMessage: vi.fn(),
    toggleFavorite: vi.fn(),
    getSessions: vi.fn(),
    getSession: vi.fn(),
  },
}));

vi.mock("@/services/api", () => ({
  chatService: chatServiceMock,
}));

describe("chat actions success", () => {
  it("returns success result for create and send message actions", async () => {
    chatServiceMock.createSession.mockResolvedValueOnce({
      data: { id: 1, uuid: "sess-1", title: "Sesi Baru" },
    });
    chatServiceMock.sendMessage.mockResolvedValue({
      data: { user_message: { id: 1 }, ai_message: { id: 2 } },
    });

    const created = await createChatSession("token", "Sesi Baru");
    const textRes = await sendTextMessage("token", "sess-1", "halo");
    const audioRes = await sendAudioMessage("token", "sess-1", "/audio.mp3");

    expect(created).toEqual({
      success: true,
      session: { id: 1, uuid: "sess-1", title: "Sesi Baru" },
    });
    expect(textRes.success).toBe(true);
    expect(audioRes.success).toBe(true);
    expect(chatServiceMock.sendMessage).toHaveBeenCalledWith("token", "sess-1", "/audio.mp3", "audio");
  });

  it("returns success result for favorite and load actions", async () => {
    chatServiceMock.toggleFavorite.mockResolvedValueOnce({});
    chatServiceMock.getSessions.mockResolvedValueOnce({ data: [{ uuid: "s-1" }] });
    chatServiceMock.getSession.mockResolvedValueOnce({ data: { uuid: "s-1", messages: [] } });

    const favoriteRes = await toggleFavorite("token", "s-1");
    const sessionsRes = await loadChatSessions("token", "favorites", 10);
    const sessionRes = await loadChatSession("token", "s-1");

    expect(favoriteRes).toEqual({ success: true });
    expect(sessionsRes).toEqual({ success: true, sessions: [{ uuid: "s-1" }] });
    expect(sessionRes).toEqual({ success: true, session: { uuid: "s-1", messages: [] } });
  });
});
