"use server";

import { chatService } from "@/services/api";
import { ChatSession, ChatMessage } from "@/types";

interface CreateSessionResult {
  success: boolean;
  session?: { id: number; title: string };
  error?: string;
}

/**
 * Create a new chat session.
 */
export async function createChatSession(
  token: string,
  title: string
): Promise<CreateSessionResult> {
  try {
    const response = (await chatService.createSession(token, title)) as {
      data: { id: number; title: string };
    };
    return { success: true, session: response.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create session";
    return { success: false, error: message };
  }
}

interface SendMessageResult {
  success: boolean;
  userMessage?: ChatMessage;
  aiMessage?: ChatMessage;
  error?: string;
}

/**
 * Send a text message to a chat session.
 */
export async function sendTextMessage(
  token: string,
  sessionId: number,
  content: string
): Promise<SendMessageResult> {
  try {
    const response = await chatService.sendMessage(token, sessionId, content);
    return {
      success: true,
      userMessage: response.data.user_message,
      aiMessage: response.data.ai_message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    return { success: false, error: message };
  }
}

/**
 * Send an audio message to a chat session.
 */
export async function sendAudioMessage(
  token: string,
  sessionId: number,
  audioUrl: string
): Promise<SendMessageResult> {
  try {
    const response = await chatService.sendMessage(token, sessionId, audioUrl, "audio");
    return {
      success: true,
      userMessage: response.data.user_message,
      aiMessage: response.data.ai_message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send audio message";
    return { success: false, error: message };
  }
}

interface ToggleResult {
  success: boolean;
  error?: string;
}

/**
 * Toggle favorite status for a chat session.
 */
export async function toggleFavorite(token: string, sessionId: number): Promise<ToggleResult> {
  try {
    await chatService.toggleFavorite(token, sessionId);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle favorite";
    return { success: false, error: message };
  }
}

/**
 * Toggle trash status for a chat session.
 */
export async function toggleTrash(token: string, sessionId: number): Promise<ToggleResult> {
  try {
    await chatService.toggleTrash(token, sessionId);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle trash";
    return { success: false, error: message };
  }
}

/**
 * Delete a chat session permanently.
 */
export async function deleteChatSession(token: string, sessionId: number): Promise<ToggleResult> {
  try {
    await chatService.deleteSession(token, sessionId);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete session";
    return { success: false, error: message };
  }
}

/**
 * Toggle like status for a message.
 */
export async function toggleMessageLike(token: string, messageId: number): Promise<ToggleResult> {
  try {
    await chatService.toggleLike(token, messageId);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle like";
    return { success: false, error: message };
  }
}

/**
 * Toggle dislike status for a message.
 */
export async function toggleMessageDislike(
  token: string,
  messageId: number
): Promise<ToggleResult> {
  try {
    await chatService.toggleDislike(token, messageId);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle dislike";
    return { success: false, error: message };
  }
}

interface LoadSessionsResult {
  success: boolean;
  sessions?: ChatSession[];
  error?: string;
}

/**
 * Load chat sessions with optional filtering.
 */
export async function loadChatSessions(
  token: string,
  filter: string = "all",
  limit: number = 50
): Promise<LoadSessionsResult> {
  try {
    const response = (await chatService.getSessions(token, { filter, limit })) as {
      data: ChatSession[];
    };
    return { success: true, sessions: response.data || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load sessions";
    return { success: false, error: message };
  }
}

interface LoadSessionResult {
  success: boolean;
  session?: ChatSession & { messages: ChatMessage[] };
  error?: string;
}

/**
 * Load a specific chat session with messages.
 */
export async function loadChatSession(
  token: string,
  sessionId: number
): Promise<LoadSessionResult> {
  try {
    const response = (await chatService.getSession(token, sessionId)) as {
      data: ChatSession & { messages: ChatMessage[] };
    };
    return { success: true, session: response.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load session";
    return { success: false, error: message };
  }
}
