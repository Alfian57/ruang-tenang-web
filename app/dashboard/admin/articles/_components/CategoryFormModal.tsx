"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    formData: {
        name: string;
        description: string;
    };
    setFormData: (data: {
        name: string;
        description: string;
    }) => void;
    isSaving: boolean;
    onSave: () => void;
}

export function CategoryFormModal({
    isOpen,
    onClose,
    isEditing,
    formData,
    setFormData,
    isSaving,
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
                        <Label>Nama Kategori</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Masukkan nama kategori"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <textarea
                            className="w-full p-3 border rounded-lg min-h-24 resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Deskripsi kategori (opsional)"
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
