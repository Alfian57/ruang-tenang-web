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
import { AlertTriangle, Trash2, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmDialogVariant = "danger" | "warning" | "info" | "default";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmDialogVariant;
    isLoading?: boolean;
    icon?: React.ReactNode;
}

const variantConfig: Record<
    ConfirmDialogVariant,
    {
        iconBg: string;
        iconColor: string;
        DefaultIcon: typeof Trash2;
        confirmButtonClass: string;
    }
> = {
    danger: {
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        DefaultIcon: Trash2,
        confirmButtonClass: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600",
        DefaultIcon: AlertTriangle,
        confirmButtonClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
    },
    info: {
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        DefaultIcon: Info,
        confirmButtonClass: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    default: {
        iconBg: "bg-gray-100",
        iconColor: "text-gray-600",
        DefaultIcon: HelpCircle,
        confirmButtonClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
};

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Konfirmasi",
    cancelText = "Batal",
    variant = "default",
    isLoading = false,
    icon,
}: ConfirmDialogProps) {
    const [loading, setLoading] = React.useState(false);
    const config = variantConfig[variant];
    const IconComponent = config.DefaultIcon;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    };

    const isProcessing = isLoading || loading;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div
                        className={cn(
                            "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4",
                            config.iconBg
                        )}
                    >
                        {icon || <IconComponent className={cn("w-6 h-6", config.iconColor)} />}
                    </div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    <DialogDescription className="text-center">{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="sm:flex-1 rounded-xl"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className={cn("sm:flex-1 rounded-xl", config.confirmButtonClass)}
                    >
                        {isProcessing ? "Memproses..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Helper hook for easy usage
interface UseConfirmDialogOptions {
    title: string;
    description: string;
    variant?: ConfirmDialogVariant;
    confirmText?: string;
    cancelText?: string;
}

export function useConfirmDialog() {
    const [state, setState] = React.useState<{
        isOpen: boolean;
        options: UseConfirmDialogOptions | null;
        resolve: ((confirmed: boolean) => void) | null;
    }>({
        isOpen: false,
        options: null,
        resolve: null,
    });

    const confirm = React.useCallback((options: UseConfirmDialogOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                options,
                resolve,
            });
        });
    }, []);

    const handleClose = React.useCallback(() => {
        setState((prev) => {
            prev.resolve?.(false);
            return { isOpen: false, options: null, resolve: null };
        });
    }, []);

    const handleConfirm = React.useCallback(() => {
        setState((prev) => {
            prev.resolve?.(true);
            return { isOpen: false, options: null, resolve: null };
        });
    }, []);

    const ConfirmDialogComponent = React.useCallback(
        () =>
            state.options ? (
                <ConfirmDialog
                    isOpen={state.isOpen}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    title={state.options.title}
                    description={state.options.description}
                    variant={state.options.variant}
                    confirmText={state.options.confirmText}
                    cancelText={state.options.cancelText}
                />
            ) : null,
        [state.isOpen, state.options, handleClose, handleConfirm]
    );

    return { confirm, ConfirmDialog: ConfirmDialogComponent };
}
