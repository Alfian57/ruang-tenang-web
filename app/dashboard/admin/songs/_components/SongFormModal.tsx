"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Loader2, Upload } from "lucide-react";
import { RefObject, ChangeEvent } from "react";
import { SongCategory } from "@/types";

interface SongFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: {
        title: string;
        file_path: string;
        thumbnail: string;
        category_id: number;
    };
    setFormData: (data: {
        title: string;
        file_path: string;
        thumbnail: string;
        category_id: number;
    }) => void;
    categories: SongCategory[];
    token: string | null;
    isUploadingAudio: boolean;
    audioInputRef: RefObject<HTMLInputElement | null>;
    handleAudioUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
}

export function SongFormModal({
    isOpen,
    onClose,
    isEditing,
    formData,
    setFormData,
    categories,
    token,
    isUploadingAudio,
    audioInputRef,
    handleAudioUpload,
    onSave
}: SongFormModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Lagu" : "Tambah Lagu"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Judul</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Masukkan judul lagu"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Kategori</Label>
                        <select
                            className="w-full p-2 border rounded-lg bg-white"
                            value={formData.category_id || ""}
                            onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <Label>File Audio</Label>
                        <div className="flex gap-2">
                            <Input
                                value={formData.file_path ? "File audio terupload" : ""}
                                readOnly
                                placeholder="Upload file audio"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => audioInputRef.current?.click()}
                                disabled={isUploadingAudio}
                            >
                                {isUploadingAudio ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </Button>
                        </div>
                        <input
                            ref={audioInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioUpload}
                            className="hidden"
                        />
                        <p className="text-xs text-gray-500">Upload file audio (mp3, wav, ogg max 10MB)</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Thumbnail</Label>
                        {token && (
                            <ImageUpload
                                value={formData.thumbnail}
                                onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                                token={token}
                                aspectRatio="square"
                            />
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Batal</Button>
                    <Button onClick={onSave} className="gradient-primary" disabled={!formData.category_id}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
