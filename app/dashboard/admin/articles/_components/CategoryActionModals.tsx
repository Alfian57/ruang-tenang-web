"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface CategoryDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function CategoryDeleteModal({ isOpen, onClose, onConfirm }: CategoryDeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Kategori?</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 py-4">
                    Kategori yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Batal</Button>
                    <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={onConfirm}>
                        Hapus
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface CategoryCannotDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CategoryCannotDeleteModal({ isOpen, onClose }: CategoryCannotDeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tidak Bisa Menghapus Kategori</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-center text-gray-600">
                        Kategori ini masih memiliki artikel di dalamnya. Silakan hapus atau pindahkan artikel-artikel tersebut terlebih dahulu sebelum menghapus kategori ini.
                    </p>
                </div>
                <DialogFooter>
                    <Button onClick={onClose} className="gradient-primary w-full">
                        Mengerti
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
