import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatMessagesArea } from "@/app/dashboard/chat/_components/ChatMessagesArea";

describe("ChatMessagesArea", () => {
    it("renders empty state when no active session", () => {
        render(
            <ChatMessagesArea
                activeSession={null}
                messages={[]}
                isSending={false}
                isRecording={false}
                messagesEndRef={{ current: null }}
                onSendText={vi.fn()}
                onSendAudio={vi.fn()}
                onToggleMessageLike={vi.fn()}
                onCreateSession={vi.fn()}
            />
        );

        expect(screen.getByText("Chat Baru")).toBeInTheDocument();
        expect(screen.getByText("Mulai Percakapan Baru")).toBeInTheDocument();
    });

    it("renders active session header", () => {
        render(
            <ChatMessagesArea
                activeSession={{ title: "Sesi Tes" } as any}
                messages={[]}
                isSending={false}
                isRecording={false}
                messagesEndRef={{ current: null }}
                onSendText={vi.fn()}
                onSendAudio={vi.fn()}
                onToggleMessageLike={vi.fn()}
                onCreateSession={vi.fn()}
            />
        );

        expect(screen.getByText("Sesi Tes")).toBeInTheDocument();
    });
});
