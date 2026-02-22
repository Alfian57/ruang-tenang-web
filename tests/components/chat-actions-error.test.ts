import { describe, expect, it, vi } from "vitest";

import {
  createChatSession,
  deleteChatSession,
  loadChatSession,
  loadChatSessions,
  sendTextMessage,
  toggleMessageDislike,
  toggleMessageLike,
  toggleTrash,
} from "@/app/dashboard/chat/actions";

const { chatServiceMock } = vi.hoisted(() => ({
  chatServiceMock: {
    createSession: vi.fn(),
    sendMessage: vi.fn(),
    toggleTrash: vi.fn(),
    deleteSession: vi.fn(),
    toggleLike: vi.fn(),
    toggleDislike: vi.fn(),
    getSessions: vi.fn(),
    getSession: vi.fn(),
  },
}));

vi.mock("@/services/api", () => ({
  chatService: chatServiceMock,
}));

describe("chat actions error", () => {
  it("maps thrown error into action error response", async () => {
    chatServiceMock.createSession.mockRejectedValueOnce(new Error("create gagal"));
    chatServiceMock.sendMessage.mockRejectedValueOnce(new Error("send gagal"));
    chatServiceMock.toggleTrash.mockRejectedValueOnce(new Error("trash gagal"));
    chatServiceMock.deleteSession.mockRejectedValueOnce(new Error("delete gagal"));

    const created = await createChatSession("token", "x");
    const sent = await sendTextMessage("token", "s-1", "halo");
    const trashed = await toggleTrash("token", "s-1");
    const deleted = await deleteChatSession("token", "s-1");

    expect(created).toEqual({ success: false, error: "create gagal" });
    expect(sent).toEqual({ success: false, error: "send gagal" });
    expect(trashed).toEqual({ success: false, error: "trash gagal" });
    expect(deleted).toEqual({ success: false, error: "delete gagal" });
  });

  it("returns default fallback message for non-Error throws", async () => {
    chatServiceMock.toggleLike.mockRejectedValueOnce("boom");
    chatServiceMock.toggleDislike.mockRejectedValueOnce("boom");
    chatServiceMock.getSessions.mockRejectedValueOnce("boom");
    chatServiceMock.getSession.mockRejectedValueOnce("boom");

    const like = await toggleMessageLike("token", 1);
    const dislike = await toggleMessageDislike("token", 1);
    const sessions = await loadChatSessions("token");
    const session = await loadChatSession("token", "s-1");

    expect(like).toEqual({ success: false, error: "Failed to toggle like" });
    expect(dislike).toEqual({ success: false, error: "Failed to toggle dislike" });
    expect(sessions).toEqual({ success: false, error: "Failed to load sessions" });
    expect(session).toEqual({ success: false, error: "Failed to load session" });
  });
});
