"use client";

import * as React from "react";
import { cn } from "@/utils";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked);
            onChange?.(e);
        };

        return (
            <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
                <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    onChange={handleChange}
                    ref={ref}
                    {...props}
                />
                <div
                    className={cn(
                        "peer h-5 w-9 rounded-full border-2 border-transparent bg-input shadow-sm transition-colors",
                        "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                        "peer-checked:bg-primary",
                        "after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-background after:shadow-lg after:transition-transform",
                        "peer-checked:after:translate-x-4"
                    )}
                />
            </label>
        );
    }
);
Switch.displayName = "Switch";

// Enhanced Switch with label
interface SwitchFieldProps extends SwitchProps {
    label: string;
    description?: string;
    labelPosition?: "left" | "right";
}

const SwitchField = React.forwardRef<HTMLInputElement, SwitchFieldProps>(
    ({ label, description, labelPosition = "right", className, id, ...props }, ref) => {
        const generatedId = React.useId();
        const switchId = id || generatedId;

        const labelContent = (
            <div className="flex flex-col">
                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </span>
                {description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                )}
            </div>
        );

        return (
            <div
                className={cn(
                    "flex items-center gap-3",
                    labelPosition === "left" && "flex-row-reverse justify-end",
                    className
                )}
            >
                <Switch ref={ref} id={switchId} {...props} />
                {labelContent}
            </div>
        );
    }
);
SwitchField.displayName = "SwitchField";

export { Switch, SwitchField };
