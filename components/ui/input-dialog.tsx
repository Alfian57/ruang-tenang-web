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
import { Input } from "@/components/ui/input";
import { Link2, ImageIcon } from "lucide-react";
import { cn } from "@/utils";

type InputDialogVariant = "url" | "image" | "default";

interface InputDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: InputDialogVariant;
    validation?: (value: string) => string | null; // Returns error message or null
}

const variantConfig: Record<
    InputDialogVariant,
    {
        iconBg: string;
        iconColor: string;
        Icon: typeof Link2;
        inputType: string;
    }
> = {
    url: {
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        Icon: Link2,
        inputType: "url",
    },
    image: {
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        Icon: ImageIcon,
        inputType: "url",
    },
    default: {
        iconBg: "bg-gray-100",
        iconColor: "text-gray-600",
        Icon: Link2,
        inputType: "text",
    },
};

export function InputDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    placeholder = "Masukkan nilai...",
    defaultValue = "",
    confirmText = "Simpan",
    cancelText = "Batal",
    variant = "default",
    validation,
}: InputDialogProps) {
    const [value, setValue] = React.useState(defaultValue);
    const [error, setError] = React.useState<string | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const config = variantConfig[variant];
    const IconComponent = config.Icon;

    // Reset value when dialog opens/closes
    React.useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
            setError(null);
            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, defaultValue]);

    const handleConfirm = () => {
        // Validate if validation function provided
        if (validation) {
            const validationError = validation(value);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        // Basic URL validation for URL variants
        if ((variant === "url" || variant === "image") && value.trim()) {
            try {
                new URL(value);
            } catch {
                setError("URL tidak valid");
                return;
            }
        }

        onConfirm(value);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div
                        className={cn(
                            "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4",
                            config.iconBg
                        )}
                    >
                        <IconComponent className={cn("w-6 h-6", config.iconColor)} />
                    </div>
                    <DialogTitle className="text-center">{title}</DialogTitle>
                    {description && (
                        <DialogDescription className="text-center">{description}</DialogDescription>
                    )}
                </DialogHeader>
                <div className="py-4">
                    <Input
                        ref={inputRef}
                        type={config.inputType}
                        value={value}
                        onChange={(e) => {
                            setValue(e.target.value);
                            setError(null);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        error={error || undefined}
                        className="w-full"
                    />
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="sm:flex-1 rounded-xl"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="sm:flex-1 rounded-xl"
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Helper hook for easy usage
interface UseInputDialogOptions {
    title: string;
    description?: string;
    placeholder?: string;
    defaultValue?: string;
    variant?: InputDialogVariant;
    confirmText?: string;
    cancelText?: string;
    validation?: (value: string) => string | null;
}

export function useInputDialog() {
    const [state, setState] = React.useState<{
        isOpen: boolean;
        options: UseInputDialogOptions | null;
        resolve: ((value: string | null) => void) | null;
    }>({
        isOpen: false,
        options: null,
        resolve: null,
    });

    const prompt = React.useCallback(
        (options: UseInputDialogOptions): Promise<string | null> => {
            return new Promise((resolve) => {
                setState({
                    isOpen: true,
                    options,
                    resolve,
                });
            });
        },
        []
    );

    const handleClose = React.useCallback(() => {
        setState((prev) => {
            prev.resolve?.(null);
            return { isOpen: false, options: null, resolve: null };
        });
    }, []);

    const handleConfirm = React.useCallback(
        (value: string) => {
            setState((prev) => {
                prev.resolve?.(value);
                return { isOpen: false, options: null, resolve: null };
            });
        },
        []
    );

    const InputDialogComponent = React.useCallback(
        () =>
            state.options ? (
                <InputDialog
                    isOpen={state.isOpen}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    title={state.options.title}
                    description={state.options.description}
                    placeholder={state.options.placeholder}
                    defaultValue={state.options.defaultValue}
                    variant={state.options.variant}
                    confirmText={state.options.confirmText}
                    cancelText={state.options.cancelText}
                    validation={state.options.validation}
                />
            ) : null,
        [state.isOpen, state.options, handleClose, handleConfirm]
    );

    return { prompt, InputDialog: InputDialogComponent };
}
