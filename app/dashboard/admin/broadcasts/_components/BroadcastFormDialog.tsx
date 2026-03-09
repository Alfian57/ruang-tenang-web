"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { BroadcastNotification, CreateBroadcastPayload } from "@/services/api/broadcast";

interface BroadcastFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateBroadcastPayload) => void;
    isSubmitting: boolean;
    editData?: BroadcastNotification | null;
}

export function BroadcastFormDialog({ open, onClose, onSubmit, isSubmitting, editData }: BroadcastFormDialogProps) {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [icon, setIcon] = useState("");
    const [url, setUrl] = useState("");
    const [useSchedule, setUseSchedule] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");

    useEffect(() => {
        if (editData) {
            setTitle(editData.title);
            setBody(editData.body);
            setIcon(editData.icon || "");
            setUrl(editData.url || "");
            if (editData.scheduled_at) {
                setUseSchedule(true);
                const dt = new Date(editData.scheduled_at);
                setScheduledDate(dt.toISOString().split("T")[0]);
                setScheduledTime(dt.toTimeString().slice(0, 5));
            } else {
                setUseSchedule(false);
                setScheduledDate("");
                setScheduledTime("");
            }
        } else {
            setTitle("");
            setBody("");
            setIcon("");
            setUrl("");
            setUseSchedule(false);
            setScheduledDate("");
            setScheduledTime("");
        }
    }, [editData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data: CreateBroadcastPayload = {
            title,
            body,
            icon: icon || undefined,
            url: url || undefined,
        };
        if (useSchedule && scheduledDate && scheduledTime) {
            const dt = new Date(`${scheduledDate}T${scheduledTime}:00`);
            data.scheduled_at = dt.toISOString();
        }
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editData ? "Edit Broadcast" : "Buat Broadcast Baru"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bc-title">Judul *</Label>
                        <Input
                            id="bc-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Judul notifikasi"
                            required
                            maxLength={255}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bc-body">Pesan *</Label>
                        <Textarea
                            id="bc-body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Isi pesan notifikasi yang akan dikirim ke semua pengguna..."
                            required
                            className="min-h-25"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="bc-icon">Icon URL</Label>
                            <Input
                                id="bc-icon"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                placeholder="/favicon/android-chrome-192x192.png"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bc-url">Link Tujuan</Label>
                            <Input
                                id="bc-url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="/dashboard"
                            />
                        </div>
                    </div>

                    {/* Schedule toggle */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useSchedule}
                                onChange={(e) => setUseSchedule(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Jadwalkan pengiriman</span>
                        </label>

                        {useSchedule && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="bc-date">Tanggal</Label>
                                    <Input
                                        id="bc-date"
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        required={useSchedule}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bc-time">Waktu</Label>
                                    <Input
                                        id="bc-time"
                                        type="time"
                                        value={scheduledTime}
                                        onChange={(e) => setScheduledTime(e.target.value)}
                                        required={useSchedule}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Batal
                        </Button>
                        <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Menyimpan...
                                </>
                            ) : editData ? (
                                "Simpan Perubahan"
                            ) : useSchedule ? (
                                "Jadwalkan"
                            ) : (
                                "Simpan Draft"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
