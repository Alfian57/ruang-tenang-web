"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArticleCategory } from "@/types";

interface ArticleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: {
        title: string;
        content: string;
        category_id: number;
        thumbnail: string;
    };
    setFormData: (data: {
        title: string;
        content: string;
        category_id: number;
        thumbnail: string;
    }) => void;
    categories: ArticleCategory[];
    token: string | null;
    isSaving: boolean;
    onSave: () => void;
}

export function ArticleFormModal({
    isOpen,
    onClose,
    isEditing,
    formData,
    setFormData,
    categories,
    token,
    isSaving,
    onSave
}: ArticleFormModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Artikel" : "Tambah Artikel"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Judul</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Masukkan judul artikel"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <select
                                className="w-full p-2 border rounded-lg bg-white"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                            >
                                <option value={0}>Pilih kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Thumbnail</Label>
                        {token && (
                            <ImageUpload
                                value={formData.thumbnail}
                                onChange={(url) => setFormData({ ...formData, thumbnail: url })}
                                token={token}
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Konten</Label>
                        <RichTextEditor
                            content={formData.content}
                            onChange={(html) => setFormData({ ...formData, content: html })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Batal</Button>
                    <Button onClick={onSave} className="gradient-primary" disabled={isSaving}>
                        {isSaving ? "Menyimpan..." : "Simpan"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
