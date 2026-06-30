"use client";

import dynamic from "next/dynamic";

/// Skeleton ringan saat bundle game dimuat.
function GameSkeleton() {
    return (
        <div className="w-full aspect-[10/3] animate-pulse rounded-xl bg-red-50 flex items-center justify-center">
            <span className="text-sm text-red-300">Memuat game…</span>
        </div>
    );
}

/// Lazy-load MindfulRunnerGame agar bundle game (canvas + logika) hanya
/// diunduh saat benar-benar dibutuhkan (halaman game / offline), bukan ikut
/// terbawa di bundle awal aplikasi. `ssr: false` karena game butuh `window`
/// & `requestAnimationFrame`.
const MindfulRunnerGame = dynamic(() => import("./MindfulRunnerGame"), {
    ssr: false,
    loading: () => <GameSkeleton />,
});

export default function LazyMindfulRunnerGame() {
    return <MindfulRunnerGame />;
}
