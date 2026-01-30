"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
    return (
        <SonnerToaster
            position="top-center"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast bg-background text-foreground border-border shadow-lg rounded-xl",
                    title: "text-foreground font-medium",
                    description: "text-muted-foreground text-sm",
                    actionButton: "bg-primary text-primary-foreground",
                    cancelButton: "bg-muted text-muted-foreground",
                    closeButton: "text-muted-foreground hover:text-foreground",
                    error: "bg-destructive text-destructive-foreground border-destructive",
                    success: "bg-green-50 text-green-900 border-green-200",
                    warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
                    info: "bg-blue-50 text-blue-900 border-blue-200",
                },
            }}
            expand={true}
            richColors
            closeButton
        />
    );
}

export { toast } from "sonner";
