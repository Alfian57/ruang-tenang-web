"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AdminArticle } from "../_hooks/useAdminArticles";

interface ArticleDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function ArticleDeleteModal({ isOpen, onClose, onConfirm }: ArticleDeleteModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Artikel?</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 py-4">
                    Artikel yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
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

interface ArticleBlockModalProps {
    isOpen: boolean;
    onClose: () => void;
    article: AdminArticle | undefined;
    onConfirm: () => void;
}

export function ArticleBlockModal({ isOpen, onClose, article, onConfirm }: ArticleBlockModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {article?.status === "blocked" ? "Unblock Artikel?" : "Block Artikel?"}
                    </DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 py-4">
                    {article?.status === "blocked"
                        ? "Artikel akan dipublikasikan kembali dan dapat dilihat oleh semua orang."
                        : "Artikel akan disembunyikan dari publik dan pemilik tidak dapat mengeditnya."}
                </p>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Batal</Button>
                    <Button
                        className={article?.status === "blocked"
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-yellow-500 hover:bg-yellow-600 text-white"}
                        onClick={onConfirm}
                    >
                        {article?.status === "blocked" ? "Unblock" : "Block"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
