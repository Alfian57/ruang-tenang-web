"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "./button";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    showHomeButton?: boolean;
    showBackButton?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({ errorInfo });

        // Log error to console in development
        if (process.env.NODE_ENV === "development") {
            console.error("Error caught by ErrorBoundary:", error, errorInfo);
        }

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoBack = (): void => {
        if (typeof window !== "undefined") {
            window.history.back();
        }
    };

    handleGoHome = (): void => {
        if (typeof window !== "undefined") {
            window.location.href = "/";
        }
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    className="flex min-h-100 flex-col items-center justify-center p-6 text-center"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="mb-6 rounded-full bg-destructive/10 p-4">
                        <AlertTriangle className="h-12 w-12 text-destructive" aria-hidden="true" />
                    </div>

                    <h2 className="mb-2 text-2xl font-semibold text-foreground">
                        Oops! Terjadi Kesalahan
                    </h2>

                    <p className="mb-6 max-w-md text-muted-foreground">
                        Maaf, terjadi kesalahan saat memuat halaman ini.
                        Silakan coba lagi atau kembali ke halaman sebelumnya.
                    </p>

                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <details className="mb-6 max-w-lg text-left">
                            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                                Detail Error (Development Only)
                            </summary>
                            <pre className="mt-2 overflow-auto rounded-lg bg-muted p-4 text-xs">
                                <code>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </code>
                            </pre>
                        </details>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button
                            onClick={this.handleReset}
                            className="gap-2"
                            aria-label="Coba lagi memuat halaman"
                        >
                            <RefreshCw className="h-4 w-4" aria-hidden="true" />
                            Coba Lagi
                        </Button>

                        {this.props.showBackButton !== false && (
                            <Button
                                variant="outline"
                                onClick={this.handleGoBack}
                                className="gap-2"
                                aria-label="Kembali ke halaman sebelumnya"
                            >
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                Kembali
                            </Button>
                        )}

                        {this.props.showHomeButton !== false && (
                            <Button
                                variant="ghost"
                                onClick={this.handleGoHome}
                                className="gap-2"
                                aria-label="Ke halaman utama"
                            >
                                <Home className="h-4 w-4" aria-hidden="true" />
                                Beranda
                            </Button>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for easier use with hooks
interface ErrorBoundaryWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

    const ComponentWithErrorBoundary = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );

    ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

    return ComponentWithErrorBoundary;
}

// Simple error fallback component
interface ErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
    title?: string;
    message?: string;
}

export function ErrorFallback({
    error,
    resetError,
    title = "Terjadi Kesalahan",
    message = "Maaf, terjadi kesalahan. Silakan coba lagi.",
}: ErrorFallbackProps) {
    return (
        <div
            className="flex flex-col items-center justify-center p-6 text-center"
            role="alert"
            aria-live="assertive"
        >
            <AlertTriangle className="mb-4 h-10 w-10 text-destructive" aria-hidden="true" />
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{message}</p>
            {process.env.NODE_ENV === "development" && error && (
                <p className="mb-4 text-xs text-muted-foreground">{error.message}</p>
            )}
            {resetError && (
                <Button onClick={resetError} size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Coba Lagi
                </Button>
            )}
        </div>
    );
}
