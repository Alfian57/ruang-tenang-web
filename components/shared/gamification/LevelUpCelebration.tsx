"use client";

import { cn } from "@/utils";
import { LevelUpCelebration as LevelUpCelebrationData } from "@/types";
import { FeatureUnlockCelebration } from "./FeatureComponents";
import { Star, Sparkles, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

interface LevelUpCelebrationProps {
    celebration: LevelUpCelebrationData;
    onClose: () => void;
    className?: string;
}

export function LevelUpCelebration({ celebration, onClose, className }: LevelUpCelebrationProps) {
    const [showFeatures, setShowFeatures] = useState(false);

    useEffect(() => {
        if (typeof document === "undefined") return;

        // Simple confetti effect using CSS animation
        const duration = 3000;
        const end = Date.now() + duration;
        let isMounted = true;
        const timeoutIds: number[] = [];

        const trackedTimeout = (callback: () => void, delay: number) => {
            const id = window.setTimeout(callback, delay);
            timeoutIds.push(id);
            return id;
        };

        const createConfetti = () => {
            if (!isMounted || Date.now() > end) return;

            // Create confetti particles
            for (let i = 0; i < 10; i++) {
                const confetti = document.createElement("div");
                confetti.className = "confetti-particle";
                confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${celebration.tier_color};
          left: ${Math.random() * 100}%;
          top: -10px;
          z-index: 9999;
          pointer-events: none;
          animation: fall 3s ease-out forwards;
          transform: rotate(${Math.random() * 360}deg);
        `;
                document.body.appendChild(confetti);
                trackedTimeout(() => confetti.remove(), 3000);
            }

            trackedTimeout(createConfetti, 200);
        };

        // Add animation keyframes
        const style = document.createElement("style");
        style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
        document.head.appendChild(style);

        createConfetti();

        return () => {
            isMounted = false;
            timeoutIds.forEach((id) => clearTimeout(id));
            style.remove();
            document.querySelectorAll(".confetti-particle").forEach((particle) => {
                particle.remove();
            });
        };
    }, [celebration.tier_color]);

    if (showFeatures && celebration.newly_unlocked_features.length > 0) {
        return (
            <FeatureUnlockCelebration
                features={celebration.newly_unlocked_features}
                levelName={celebration.tier_name}
                onClose={onClose}
            />
        );
    }

    return (
        <div className={cn(
            "fixed inset-0 bg-black/60 flex items-center justify-center z-50",
            className
        )}>
            <div className="bg-card rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-in fade-in zoom-in">
                {/* Level Badge */}
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 relative"
                    style={{ backgroundColor: celebration.tier_color }}
                >
                    <span className="text-4xl font-bold text-white">
                        {celebration.new_level}
                    </span>
                    <div className="absolute -top-2 -right-2">
                        <ChevronUp className="h-8 w-8 text-green-400 animate-bounce" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold mb-2">Level Up! 🎉</h2>
                <p
                    className="text-xl font-semibold mb-2"
                    style={{ color: celebration.tier_color }}
                >
                    {celebration.tier_name}
                </p>

                {/* Description */}
                <p className="text-muted-foreground mb-4">
                    {celebration.level_description}
                </p>

                {/* Celebration Message */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Pesan Untukmu</span>
                        <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="text-sm">{celebration.celebration_message}</p>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    {celebration.newly_unlocked_features.length > 0 ? (
                        <>
                            <button
                                onClick={() => setShowFeatures(true)}
                                className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Sparkles className="h-5 w-5" />
                                Lihat Fitur Baru ({celebration.newly_unlocked_features.length})
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full text-muted-foreground hover:text-foreground transition-colors py-2"
                            >
                                Nanti Saja
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition-colors"
                        >
                            Lanjutkan Perjalanan
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
