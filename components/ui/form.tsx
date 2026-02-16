"use client";

import * as React from "react";
import { cn } from "@/utils";
import { AlertCircle } from "lucide-react";

// Form Context for managing form state
interface FormContextValue {
    errors: Record<string, string>;
    setError: (field: string, message: string) => void;
    clearError: (field: string) => void;
    clearAllErrors: () => void;
}

const FormContext = React.createContext<FormContextValue | null>(null);

export function useFormContext() {
    const context = React.useContext(FormContext);
    if (!context) {
        throw new Error("useFormContext must be used within a FormProvider");
    }
    return context;
}

// Form Provider
interface FormProviderProps {
    children: React.ReactNode;
    onSubmit?: (e: React.FormEvent) => void;
    className?: string;
}

export function Form({ children, onSubmit, className }: FormProviderProps) {
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const setError = React.useCallback((field: string, message: string) => {
        setErrors((prev) => ({ ...prev, [field]: message }));
    }, []);

    const clearError = React.useCallback((field: string) => {
        setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const clearAllErrors = React.useCallback(() => {
        setErrors({});
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(e);
    };

    return (
        <FormContext.Provider value={{ errors, setError, clearError, clearAllErrors }}>
            <form onSubmit={handleSubmit} className={className}>
                {children}
            </form>
        </FormContext.Provider>
    );
}

// Form Field wrapper
interface FormFieldProps {
    name: string;
    label?: string;
    description?: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    className?: string;
}

export function FormField({
    name,
    label,
    description,
    required,
    error: externalError,
    children,
    className,
}: FormFieldProps) {
    const id = React.useId();
    const errorId = `${id}-error`;
    const descriptionId = `${id}-description`;

    // Try to get error from context, fallback to external error
    let contextError: string | undefined;
    try {
        const context = useFormContext();
        contextError = context.errors[name];
    } catch {
        // Not in form context, use external error
    }

    const error = externalError || contextError;

    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <FormLabel htmlFor={id} required={required}>
                    {label}
                </FormLabel>
            )}
            {/* Clone children to pass aria attributes */}
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
                        id,
                        name,
                        "aria-invalid": error ? "true" : undefined,
                        "aria-describedby": cn(
                            error && errorId,
                            description && descriptionId
                        ) || undefined,
                    });
                }
                return child;
            })}
            {description && !error && (
                <FormDescription id={descriptionId}>{description}</FormDescription>
            )}
            {error && <FormError id={errorId}>{error}</FormError>}
        </div>
    );
}

// Form Label
interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export function FormLabel({
    className,
    required,
    children,
    ...props
}: FormLabelProps) {
    return (
        <label
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            )}
            {...props}
        >
            {children}
            {required && (
                <span className="text-destructive ml-1" aria-hidden="true">
                    *
                </span>
            )}
        </label>
    );
}

// Form Description
type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function FormDescription({
    className,
    children,
    ...props
}: FormDescriptionProps) {
    return (
        <p
            className={cn("text-xs text-muted-foreground", className)}
            {...props}
        >
            {children}
        </p>
    );
}

// Form Error Message
type FormErrorProps = React.HTMLAttributes<HTMLParagraphElement>;

export function FormError({ className, children, ...props }: FormErrorProps) {
    if (!children) return null;

    return (
        <p
            className={cn(
                "text-xs text-destructive flex items-center gap-1",
                className
            )}
            role="alert"
            {...props}
        >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {children}
        </p>
    );
}

// Form Actions (submit button container)
interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: "left" | "center" | "right" | "between";
}

export function FormActions({
    className,
    align = "right",
    children,
    ...props
}: FormActionsProps) {
    const alignClasses = {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
        between: "justify-between",
    };

    return (
        <div
            className={cn(
                "flex flex-wrap gap-3 pt-4",
                alignClasses[align],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// Form Section (for grouping fields)
interface FormSectionProps extends React.HTMLAttributes<HTMLFieldSetElement> {
    title?: string;
    description?: string;
}

export function FormSection({
    title,
    description,
    className,
    children,
    ...props
}: FormSectionProps) {
    return (
        <fieldset className={cn("space-y-4", className)} {...props}>
            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <legend className="text-base font-semibold text-foreground">
                            {title}
                        </legend>
                    )}
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            )}
            <div className="space-y-4">{children}</div>
        </fieldset>
    );
}
