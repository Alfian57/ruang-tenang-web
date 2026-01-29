"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Globe, Lock } from "lucide-react";
import { PlaylistListItem, CreatePlaylistRequest, UpdatePlaylistRequest } from "@/types";
import { cn } from "@/lib/utils";

interface PlaylistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    playlist?: PlaylistListItem | null;
    onSave: (data: CreatePlaylistRequest | UpdatePlaylistRequest) => Promise<void>;
    isLoading?: boolean;
}

export function PlaylistDialog({
    open,
    onOpenChange,
    playlist,
    onSave,
    isLoading,
}: PlaylistDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const isEdit = !!playlist;

    // Reset form when dialog opens/closes or playlist changes
    useEffect(() => {
        if (open) {
            if (playlist) {
                setName(playlist.name);
                setDescription(playlist.description || "");
                setIsPublic(playlist.is_public);
            } else {
                setName("");
                setDescription("");
                setIsPublic(false);
            }
        }
    }, [open, playlist]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        await onSave({
            name: name.trim(),
            description: description.trim() || undefined,
            is_public: isPublic,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Playlist" : "Buat Playlist Baru"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Playlist</Label>
                            <Input
                                id="name"
                                placeholder="Masukkan nama playlist..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={255}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi (Opsional)</Label>
                            <Input
                                id="description"
                                placeholder="Tambahkan deskripsi..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Visibilitas</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={!isPublic ? "default" : "outline"}
                                    className={cn(
                                        "flex-1",
                                        !isPublic && "gradient-primary border-0"
                                    )}
                                    onClick={() => setIsPublic(false)}
                                    disabled={isLoading}
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Privat
                                </Button>
                                <Button
                                    type="button"
                                    variant={isPublic ? "default" : "outline"}
                                    className={cn(
                                        "flex-1",
                                        isPublic && "gradient-primary border-0"
                                    )}
                                    onClick={() => setIsPublic(true)}
                                    disabled={isLoading}
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    Publik
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                                {isPublic
                                    ? "Playlist publik dapat dilihat oleh semua orang"
                                    : "Playlist privat hanya dapat dilihat oleh Anda"
                                }
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="gradient-primary border-0"
                            disabled={!name.trim() || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                isEdit ? "Simpan" : "Buat Playlist"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
