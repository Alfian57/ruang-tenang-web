"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Music, AlertCircle } from "lucide-react";

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
                        <Music className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-center text-gray-600">
                        Kategori ini masih memiliki lagu di dalamnya. Silakan hapus atau pindahkan lagu-lagu tersebut terlebih dahulu sebelum menghapus kategori ini.
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

interface SongDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function SongDeleteModal({ isOpen, onClose, onConfirm }: SongDeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Lagu?</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 py-4">
                    Lagu yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
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

interface ErrorDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

export function ErrorDialog({ isOpen, title, message, onClose }: ErrorDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {title}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 text-gray-600">
                    {message}
                </div>
                <DialogFooter>
                    <Button onClick={onClose} className="gradient-primary w-full sm:w-auto">
                        Tutup
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
