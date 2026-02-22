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
import { AlertTriangle, Phone, Heart, CheckCircle2 } from "lucide-react";

interface AIDisclaimerModalProps {
    isOpen: boolean;
    onAccept: () => void;
    onDecline?: () => void;
}

export function AIDisclaimerModal({
    isOpen,
    onAccept,
    onDecline,
}: AIDisclaimerModalProps) {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            await onAccept();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onDecline?.()}>
            <DialogContent className="sm:max-w-125">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <DialogTitle className="text-xl">Disclaimer AI Chat</DialogTitle>
                    </div>
                    <DialogDescription className="text-left space-y-4 pt-2">
                        Sebelum menggunakan fitur AI Chat, harap pahami hal-hal berikut:
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-blue-900 dark:text-blue-100">
                                Bukan Pengganti Profesional
                            </p>
                            <p className="text-blue-700 dark:text-blue-300 mt-1">
                                AI Chat ini dirancang untuk memberikan dukungan emosional awal, namun
                                <strong> bukan pengganti</strong> psikolog, psikiater, atau tenaga kesehatan mental profesional.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-green-900 dark:text-green-100">
                                Tujuan Penggunaan
                            </p>
                            <p className="text-green-700 dark:text-green-300 mt-1">
                                Fitur ini bertujuan untuk membantu Anda mengekspresikan perasaan dan mendapatkan
                                perspektif baru, bukan untuk diagnosis atau pengobatan kondisi kesehatan mental.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                        <Phone className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-red-900 dark:text-red-100">
                                Dalam Keadaan Darurat
                            </p>
                            <p className="text-red-700 dark:text-red-300 mt-1">
                                Jika Anda mengalami krisis atau memiliki pikiran untuk menyakiti diri sendiri,
                                segera hubungi:
                            </p>
                            <ul className="mt-2 space-y-1 text-red-700 dark:text-red-300">
                                <li>• <strong>Into The Light:</strong> 119 ext 8</li>
                                <li>• <strong>Yayasan Pulih:</strong> 021-78842580</li>
                                <li>• <strong>LSM Jangan Bunuh Diri:</strong> 021-9696 9293</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                    {onDecline && (
                        <Button
                            variant="outline"
                            onClick={onDecline}
                            className="w-full sm:w-auto"
                        >
                            Kembali
                        </Button>
                    )}
                    <Button
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? "Memproses..." : "Saya Mengerti & Setuju"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
