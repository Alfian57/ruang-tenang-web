"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Ban, AlertCircle, UserX } from "lucide-react";
import Image from "next/image";

interface BlockUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason?: string) => Promise<void>;
    userName: string;
    userAvatar?: string;
}

export function BlockUserModal({
    isOpen,
    onClose,
    onConfirm,
    userName,
    userAvatar,
}: BlockUserModalProps) {
    const [reason, setReason] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await onConfirm(reason || undefined);
            setReason("");
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memblokir pengguna");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setReason("");
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-100">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                            <Ban className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-xl">Blokir Pengguna</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-muted-foreground/20 flex items-center justify-center overflow-hidden">
                            {userAvatar ? (
                                <Image
                                    src={userAvatar}
                                    alt={userName}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <UserX className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium">{userName}</p>
                            <p className="text-sm text-muted-foreground">
                                akan diblokir dari akun Anda
                            </p>
                        </div>
                    </div>

                    <DialogDescription className="text-sm">
                        Setelah memblokir pengguna ini:
                        <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                            <li>Anda tidak akan melihat postingan mereka</li>
                            <li>Mereka tidak akan bisa melihat postingan Anda</li>
                            <li>Mereka tidak akan bisa menghubungi Anda</li>
                        </ul>
                    </DialogDescription>

                    {/* Optional Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="block-reason" className="text-sm font-medium">
                            Alasan (opsional)
                        </Label>
                        <Textarea
                            id="block-reason"
                            placeholder="Mengapa Anda ingin memblokir pengguna ini?"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={2}
                            className="resize-none"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? "Memproses..." : "Blokir Pengguna"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Unblock confirmation modal
interface UnblockUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    userName: string;
}

export function UnblockUserModal({
    isOpen,
    onClose,
    onConfirm,
    userName,
}: UnblockUserModalProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await onConfirm();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal membuka blokir");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-87.5">
                <DialogHeader>
                    <DialogTitle>Buka Blokir</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin membuka blokir <strong>{userName}</strong>?
                        Mereka akan dapat melihat konten Anda dan menghubungi Anda lagi.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? "Memproses..." : "Buka Blokir"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
