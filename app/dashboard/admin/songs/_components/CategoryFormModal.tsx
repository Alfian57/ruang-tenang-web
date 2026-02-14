"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: {
        name: string;
        thumbnail: string;
    };
    setFormData: (data: { name: string; thumbnail: string }) => void;
    token: string | null;
    onSave: () => void;
}

export function CategoryFormModal({
    isOpen,
    onClose,
    isEditing,
    formData,
    setFormData,
    token,
    onSave
}: CategoryFormModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nama</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Masukkan nama kategori"
                        />
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
                    <Button onClick={onSave} className="gradient-primary">Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
