
import { toast } from "sonner";

/**
 * Generates a PDF file from an HTML string using html2pdf.js
 * @param htmlContent The HTML string to convert
 * @param filename The desired filename for the PDF
 */
export async function generatePdfFromHtml(htmlContent: string, filename: string): Promise<void> {
  const toastId = toast.loading("Membuat PDF...");

  try {
    // Create a temporary container for the HTML
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    
    // Style to keep it off-screen but renderable
    // Important: 'display: none' won't work with html2canvas (used by html2pdf)
    // We use fixed position off-screen
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0px';
    container.style.width = '210mm'; // A4 width
    container.style.minHeight = '297mm'; // A4 height
    container.style.backgroundColor = 'white';
    container.style.zIndex = '-9999';
    
    // Append to body so it can be rendered
    document.body.appendChild(container);
    
    // Dynamically import html2pdf.js (browser-only library)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2pdf = (await import('html2pdf.js' as any)).default;
    
    // Configure options
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true, 
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate and save
    await html2pdf().from(container).set(opt).save();
    
    // Cleanup
    document.body.removeChild(container);
    toast.success("PDF berhasil diunduh", { id: toastId });
    
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Gagal membuat PDF", { id: toastId });
    throw error;
  }
}
