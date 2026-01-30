import * as React from "react";
import { cn } from "@/lib/utils";

// Container component for consistent max-width and padding
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl" | "full";
}

const containerSizes = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
};

export function Container({
    size = "xl",
    className,
    children,
    ...props
}: ContainerProps) {
    return (
        <div
            className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", containerSizes[size], className)}
            {...props}
        >
            {children}
        </div>
    );
}

// Section component for consistent vertical spacing
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    as?: "section" | "div" | "article";
    spacing?: "sm" | "md" | "lg" | "xl";
}

const sectionSpacing = {
    sm: "py-4 sm:py-6",
    md: "py-8 sm:py-12",
    lg: "py-12 sm:py-16",
    xl: "py-16 sm:py-24",
};

export function Section({
    as: Component = "section",
    spacing = "md",
    className,
    children,
    ...props
}: SectionProps) {
    return (
        <Component className={cn(sectionSpacing[spacing], className)} {...props}>
            {children}
        </Component>
    );
}

// PageHeader component for consistent page titles
interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    backLink?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    actions,
    backLink,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn("mb-6 space-y-2", className)}>
            {backLink && <div className="mb-2">{backLink}</div>}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-muted-foreground sm:text-base">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-2">{actions}</div>
                )}
            </div>
        </div>
    );
}

// Grid layout component
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    cols?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: "sm" | "md" | "lg";
}

const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

const gridGap = {
    sm: "gap-3",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
};

export function Grid({
    cols = 3,
    gap = "md",
    className,
    children,
    ...props
}: GridProps) {
    return (
        <div
            className={cn("grid", gridCols[cols], gridGap[gap], className)}
            {...props}
        >
            {children}
        </div>
    );
}

// Flex layout component
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: "row" | "col";
    align?: "start" | "center" | "end" | "stretch" | "baseline";
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
    wrap?: boolean;
    gap?: "none" | "xs" | "sm" | "md" | "lg";
}

const flexDirection = {
    row: "flex-row",
    col: "flex-col",
};

const flexAlign = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
    baseline: "items-baseline",
};

const flexJustify = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
};

const flexGap = {
    none: "",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
};

export function Flex({
    direction = "row",
    align = "center",
    justify = "start",
    wrap = false,
    gap = "md",
    className,
    children,
    ...props
}: FlexProps) {
    return (
        <div
            className={cn(
                "flex",
                flexDirection[direction],
                flexAlign[align],
                flexJustify[justify],
                wrap && "flex-wrap",
                flexGap[gap],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// Stack component (vertical flex with gap)
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
    gap?: "xs" | "sm" | "md" | "lg" | "xl";
}

const stackGap = {
    xs: "space-y-1",
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
};

export function Stack({
    gap = "md",
    className,
    children,
    ...props
}: StackProps) {
    return (
        <div className={cn("flex flex-col", stackGap[gap], className)} {...props}>
            {children}
        </div>
    );
}

// Divider component
interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
    orientation?: "horizontal" | "vertical";
}

export function Divider({
    orientation = "horizontal",
    className,
    ...props
}: DividerProps) {
    return (
        <hr
            className={cn(
                "border-border",
                orientation === "horizontal" ? "w-full border-t" : "h-full border-l",
                className
            )}
            {...props}
        />
    );
}
