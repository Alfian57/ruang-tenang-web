"use client";

import dynamic from "next/dynamic";

function GameSkeleton() {
    return (
        <div
            className="flex h-64 w-full animate-pulse items-center justify-center rounded-[1.4rem] border sm:h-80 lg:aspect-[5/2] lg:h-auto"
            style={{
                borderColor: "var(--theme-accent-border, #fed7aa)",
                background: "linear-gradient(145deg, var(--theme-accent-soft, #fff7ed), white)",
            }}
        >
            <div className="text-center">
                <div
                    className="mx-auto mb-2 h-8 w-8 rounded-xl"
                    style={{ backgroundColor: "var(--theme-accent-light, #ffedd5)" }}
                />
                <span className="text-xs font-semibold text-slate-400">Menyiapkan perjalanan…</span>
            </div>
        </div>
    );
}

const MindfulRunnerGame = dynamic(() => import("./MindfulRunnerGame"), {
    ssr: false,
    loading: () => <GameSkeleton />,
});

export default function LazyMindfulRunnerGame() {
    return <MindfulRunnerGame />;
}
