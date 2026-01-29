"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
    value?: number[]
    defaultValue?: number[]
    max?: number
    min?: number
    step?: number
    onValueChange?: (value: number[]) => void
    className?: string
    disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    ({ className, value, defaultValue = [0], max = 100, min = 0, step = 1, onValueChange, disabled, ...props }, ref) => {
        const [internalValue, setInternalValue] = React.useState(defaultValue)
        const currentValue = value ?? internalValue
        const trackRef = React.useRef<HTMLDivElement>(null)
        const isDragging = React.useRef(false)

        const percentage = ((currentValue[0] - min) / (max - min)) * 100

        const updateValue = React.useCallback((clientX: number) => {
            if (disabled || !trackRef.current) return

            const rect = trackRef.current.getBoundingClientRect()
            const x = clientX - rect.left
            const percent = Math.max(0, Math.min(1, x / rect.width))
            const newValue = min + percent * (max - min)
            const steppedValue = Math.round(newValue / step) * step
            const clampedValue = Math.max(min, Math.min(max, steppedValue))

            const newValues = [clampedValue]
            setInternalValue(newValues)
            onValueChange?.(newValues)
        }, [disabled, max, min, step, onValueChange])

        const handleMouseDown = (e: React.MouseEvent) => {
            if (disabled) return
            isDragging.current = true
            updateValue(e.clientX)

            const handleMouseMove = (e: MouseEvent) => {
                if (isDragging.current) {
                    updateValue(e.clientX)
                }
            }

            const handleMouseUp = () => {
                isDragging.current = false
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        const handleTouchStart = (e: React.TouchEvent) => {
            if (disabled) return
            isDragging.current = true
            updateValue(e.touches[0].clientX)

            const handleTouchMove = (e: TouchEvent) => {
                if (isDragging.current) {
                    updateValue(e.touches[0].clientX)
                }
            }

            const handleTouchEnd = () => {
                isDragging.current = false
                document.removeEventListener("touchmove", handleTouchMove)
                document.removeEventListener("touchend", handleTouchEnd)
            }

            document.addEventListener("touchmove", handleTouchMove)
            document.addEventListener("touchend", handleTouchEnd)
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex w-full touch-none select-none items-center",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                {...props}
            >
                <div
                    ref={trackRef}
                    className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200 cursor-pointer"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    <div
                        className="absolute h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div
                    className={cn(
                        "absolute h-4 w-4 rounded-full border-2 border-primary bg-white shadow-md transition-all",
                        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/20",
                        disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
                    )}
                    style={{ left: `calc(${percentage}% - 8px)` }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                />
            </div>
        )
    }
)

Slider.displayName = "Slider"

export { Slider }
