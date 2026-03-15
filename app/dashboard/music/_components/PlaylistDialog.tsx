"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { uploadService } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
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
import { Loader2, Globe, Lock, Image as ImageIcon, UploadCloud } from "lucide-react";
import { PlaylistListItem, CreatePlaylistRequest, UpdatePlaylistRequest } from "@/types";
import { cn } from "@/utils";

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
    const { token } = useAuthStore();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [thumbnail, setThumbnail] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isEdit = !!playlist;

    // Reset form when dialog opens/closes or playlist changes
    useEffect(() => {
        if (open) {
            if (playlist) {
                setName(playlist.name);
                setDescription(playlist.description || "");
                setIsPublic(playlist.is_public);
                setThumbnail(playlist.thumbnail || "");
            } else {
                setName("");
                setDescription("");
                setIsPublic(false);
                setThumbnail("");
            }
        }
    }, [open, playlist]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        // Basic validation
        if (!file.type.startsWith("image/")) {
            toast.error("Format file tidak didukung");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran maksimal file adalah 2MB");
            return;
        }

        try {
            setIsUploading(true);
            const res = await uploadService.uploadImage(token, file);
            if (res.data && res.data.urls && res.data.urls.length > 0) {
                setThumbnail(res.data.urls[0]);
                toast.success("Gambar berhasil diunggah");
            }
        } catch (error) {
            toast.error("Gagal mengunggah gambar");
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (!thumbnail.trim()) {
            toast.error("Silakan unggah gambar cover playlist");
            return;
        }

        await onSave({
            name: name.trim(),
            description: description.trim() || undefined,
            is_public: isPublic,
            thumbnail: thumbnail,
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
                        <div className="space-y-3">
                            <Label>Cover Playlist <span className="text-red-500">*</span></Label>
                            <div className="flex gap-4 items-start">
                                <div 
                                    className="relative w-24 h-24 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center shrink-0 overflow-hidden group cursor-pointer"
                                    onClick={() => !isUploading && !isLoading && fileInputRef.current?.click()}
                                >
                                    {thumbnail ? (
                                        <>
                                            <Image 
                                                src={thumbnail}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <UploadCloud className="w-6 h-6 text-white" />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                            {isUploading ? (
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 opacity-50 mb-1" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <Input
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        disabled={isLoading || isUploading}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        disabled={isLoading || isUploading}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {isUploading ? "Mengunggah..." : "Pilih Gambar"}
                                    </Button>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                        Maks 2MB. Format JPG, PNG, atau WEBP. Rekomendasi rasio 1:1.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Playlist <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                placeholder="Masukkan nama playlist..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={255}
                                disabled={isLoading || isUploading}
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
                            disabled={!name.trim() || !thumbnail.trim() || isLoading || isUploading}
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
