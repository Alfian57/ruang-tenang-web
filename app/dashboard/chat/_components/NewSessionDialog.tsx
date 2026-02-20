"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Props for the NewSessionDialog component.
 */
export interface NewSessionDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when a new session is created */
  onCreateSession: (title: string) => Promise<void>;
}

/**
 * Dialog component for creating a new chat session.
 */
export function NewSessionDialog({
  open,
  onOpenChange,
  onCreateSession,
}: NewSessionDialogProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateSession(title);
      setTitle("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Obrolan Baru</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Berikan judul topik (contoh: Cemas karena ujian)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl"
            autoFocus
            disabled={isSubmitting}
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim() && !isSubmitting) {
                void handleCreate();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="rounded-xl"
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            onClick={() => void handleCreate()}
            disabled={!title.trim() || isSubmitting}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl"
          >
            {isSubmitting ? "Membuat..." : "Mulai Chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
