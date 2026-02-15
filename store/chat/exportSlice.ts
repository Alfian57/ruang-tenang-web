import { StateCreator } from "zustand";
import { toast } from "sonner";
import { ChatStore, ChatExportState, ChatExportActions } from "./types";
import { chatService } from "@/services/api";
import { ChatSessionSummary, ChatExportResponse } from "@/types";

export const createExportSlice: StateCreator<ChatStore, [], [], ChatExportState & ChatExportActions> = (set, get) => ({
  currentSummary: null,
  isGeneratingSummary: false,

  exportChat: async (token: string, sessionId: number, format: "pdf" | "txt", includePinned?: boolean) => {
    if (!token) return null;

    try {
      const response = (await chatService.exportSession(token, sessionId, format)) as {
        data: ChatExportResponse;
      };
      
      const exportData = response.data;
      
      if (format === "pdf") {
        // The content is base64 encoded PDF from backend
        // Convert base64 to Blob
        const byteCharacters = atob(exportData.content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportData.filename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Chat berhasil diekspor sebagai PDF');
      } else {
        // For TXT, download as plain text
        const blob = new Blob([exportData.content], { type: exportData.content_type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportData.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast.success('Chat berhasil diekspor sebagai TXT');
      }
      
      return exportData;
    } catch (error) {
      console.error("ChatStore.exportChat: failed", error);
      toast.error("Gagal mengekspor chat");
      return null;
    }
  },

  loadSummary: async (token: string, sessionId: number) => {
    if (!token) return;

    try {
      const response = (await chatService.getSummary(token, sessionId)) as {
        data: ChatSessionSummary;
      };
      set({ currentSummary: response.data });
    } catch {
      // Expected to fail with 404 when no summary exists yet - silently set to null
      set({ currentSummary: null });
    }
  },

  generateSummary: async (token: string, sessionId: number) => {
    if (!token) return;

    set({ isGeneratingSummary: true });
    try {
      const response = (await chatService.generateSummary(token, sessionId)) as {
        data: ChatSessionSummary;
      };
      set({ currentSummary: response.data, isGeneratingSummary: false });
    } catch (error) {
      console.error("ChatStore.generateSummary: failed", error);
      set({ isGeneratingSummary: false });
      throw error;
    }
  },
});
