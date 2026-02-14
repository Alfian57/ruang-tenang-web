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
        // The content is base64 encoded HTML, decode it
        const htmlContent = atob(exportData.content);
        
        // Create a temporary container for the HTML
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);
        
        // Dynamically import html2pdf.js (browser-only library)
        // Note: In Next.js with TS, this might need @types/html2pdf.js or ts-ignore if not present
        // Use require or dynamic import
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const html2pdf = (await import('html2pdf.js' as any)).default;
        
        // Generate PDF with proper filename
        const pdfFilename = exportData.filename.replace('.html', '.pdf');
        await html2pdf(container, {
          margin: 10,
          filename: pdfFilename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        });
        
        // Cleanup
        document.body.removeChild(container);
        
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
