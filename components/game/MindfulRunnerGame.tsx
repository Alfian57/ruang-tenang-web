"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Play, RotateCcw, ShieldCheck, Trophy, Zap } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import {
    CANVAS_H,
    CANVAS_W,
    GROUND_Y,
    renderRunnerRestingScene,
    renderRunnerScene,
    resolveRunnerPalette,
    type RunnerCloud,
    type RunnerCollectible,
    type RunnerFloatingText,
    type RunnerObstacle,
    type RunnerPalette,
    type RunnerParticle,
} from "./mindful-runner-renderer";

const GRAVITY = 0.6;
const JUMP_FORCE = -11;
const INITIAL_SPEED = 4;
const MAX_SPEED = 10;
const SPEED_INCREMENT = 0.001;
const DIFFICULTY_TIER_SCORE = 500;
const DIFFICULTY_SCALE_PER_TIER = 0.3;
const JUMP_HOLD_GRAVITY_MULT = 0.45;
const FAST_FALL_GRAVITY_MULT = 1.6;
const DOUBLE_JUMP_FORCE = -9.5;
const COYOTE_FRAMES = 6;
const MAX_JUMPS = 2;
const SHIELD_DURATION_FRAMES = 600;
const NEAR_MISS_DISTANCE = 14;
const HIGH_SCORE_STORAGE_KEY = "mindful-runner-high-score";

const GAME_OVER_MESSAGES = [
    "Setiap langkah kecil tetap berarti.",
    "Istirahat juga bagian dari perjalanan.",
    "Kamu sudah berusaha dengan baik hari ini.",
    "Jatuh bukan berarti gagal. Coba lagi saat siap.",
    "Kamu lebih kuat dari yang kamu kira.",
    "Tidak apa-apa. Ambil jeda, lalu coba lagi.",
    "Ketenangan dapat ditemukan di setiap langkah.",
    "Perjalananmu unik dan berharga.",
];

const PLAY_AFFIRMATIONS = [
    "Kamu hebat",
    "Tetap tenang",
    "Terus melangkah",
    "Kamu berharga",
    "Nikmati momennya",
    "Satu langkah lagi",
    "Kamu kuat",
    "Jaga ritmemu",
];

const OBSTACLE_LABELS = [
    "Overthinking",
    "Cemas",
    "Stres",
    "Panik",
    "Takut",
    "Sedih",
    "Marah",
    "Insomnia",
    "Lelah",
    "Ragu",
];

type GameStatus = "idle" | "playing" | "over";

interface HudState {
    score: number;
    highScore: number;
    combo: number;
    shieldSeconds: number;
}

function getRandomObstacleGap() {
    return 180 + Math.random() * 200;
}

function getRandomCollectibleGap() {
    return 250 + Math.random() * 300;
}

export default function MindfulRunnerGame() {
    const { themeKey } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paletteRef = useRef<RunnerPalette>(resolveRunnerPalette(null));
    const reducedMotionRef = useRef(false);
    const gameStateRef = useRef({
        running: false,
        score: 0,
        highScore: 0,
        speed: INITIAL_SPEED,
        playerY: GROUND_Y,
        playerVelocity: 0,
        isJumping: false,
        playerFrame: 0,
        frameCount: 0,
        jumpHeld: false,
        jumpsUsed: 0,
        coyoteCounter: 0,
        shieldFrames: 0,
        obstacles: [] as RunnerObstacle[],
        collectibles: [] as RunnerCollectible[],
        clouds: [] as RunnerCloud[],
        particles: [] as RunnerParticle[],
        floatingTexts: [] as RunnerFloatingText[],
        obstacleTravel: 0,
        collectibleTravel: 0,
        nextObstacleGap: getRandomObstacleGap(),
        nextCollectibleGap: getRandomCollectibleGap(),
        affirmation: "",
        affirmationTimer: 0,
        combo: 0,
        collected: 0,
        shakeX: 0,
        shakeY: 0,
        shakeLife: 0,
    });
    const animFrameRef = useRef(0);
    const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
    const [overMessage, setOverMessage] = useState("");
    const [hud, setHud] = useState<HudState>({
        score: 0,
        highScore: 0,
        combo: 0,
        shieldSeconds: 0,
    });

    const syncHud = useCallback(() => {
        const state = gameStateRef.current;
        const nextHud: HudState = {
            score: state.score,
            highScore: state.highScore,
            combo: state.combo,
            shieldSeconds: Math.ceil(state.shieldFrames / 60),
        };

        setHud((current) => {
            if (
                current.score === nextHud.score
                && current.highScore === nextHud.highScore
                && current.combo === nextHud.combo
                && current.shieldSeconds === nextHud.shieldSeconds
            ) {
                return current;
            }
            return nextHud;
        });
    }, []);

    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context) return;
        const state = gameStateRef.current;
        if (!state.running) return;

        state.frameCount++;

        const difficultyTier = Math.floor(state.score / DIFFICULTY_TIER_SCORE);
        const scaledSpeedIncrement = SPEED_INCREMENT * (1 + difficultyTier * DIFFICULTY_SCALE_PER_TIER);
        state.speed = Math.min(MAX_SPEED, state.speed + scaledSpeedIncrement);

        if (state.isJumping) {
            let gravity = GRAVITY;
            if (state.playerVelocity < 0) {
                gravity = state.jumpHeld ? GRAVITY * JUMP_HOLD_GRAVITY_MULT : GRAVITY;
            } else {
                gravity = state.jumpHeld ? GRAVITY : GRAVITY * FAST_FALL_GRAVITY_MULT;
            }
            state.playerVelocity += gravity;
            state.playerY += state.playerVelocity;
            if (state.playerY >= GROUND_Y) {
                state.playerY = GROUND_Y;
                state.isJumping = false;
                state.playerVelocity = 0;
                state.jumpsUsed = 0;
                state.coyoteCounter = COYOTE_FRAMES;
            }
        } else if (state.coyoteCounter > 0) {
            state.coyoteCounter--;
        }

        if (state.shieldFrames > 0) state.shieldFrames--;
        state.playerFrame++;
        state.obstacleTravel += state.speed;
        state.collectibleTravel += state.speed;

        if (state.obstacleTravel >= state.nextObstacleGap) {
            const types: RunnerObstacle["type"][] = ["thought", "stress", "spiral"];
            const type = types[Math.floor(Math.random() * types.length)];
            const width = type === "spiral" ? 28 : 30 + Math.random() * 20;
            const height = type === "stress" ? 40 + Math.random() * 15 : 25 + Math.random() * 20;
            state.obstacles.push({
                x: CANVAS_W + 20,
                width,
                height,
                type,
                label: OBSTACLE_LABELS[Math.floor(Math.random() * OBSTACLE_LABELS.length)],
            });
            state.obstacleTravel = 0;
            state.nextObstacleGap = getRandomObstacleGap();
        }

        if (state.collectibleTravel >= state.nextCollectibleGap) {
            const types: RunnerCollectible["type"][] = ["heart", "star", "lotus"];
            state.collectibles.push({
                x: CANVAS_W + 20,
                y: GROUND_Y - 20 - Math.random() * 60,
                type: types[Math.floor(Math.random() * types.length)],
                collected: false,
            });
            state.collectibleTravel = 0;
            state.nextCollectibleGap = getRandomCollectibleGap();
        }

        if (state.clouds.length < 4 && Math.random() < 0.005) {
            state.clouds.push({
                x: CANVAS_W + 50,
                y: 20 + Math.random() * 60,
                width: 40 + Math.random() * 60,
                speed: 0.3 + Math.random() * 0.5,
            });
        }

        for (let index = state.obstacles.length - 1; index >= 0; index--) {
            const obstacle = state.obstacles[index];
            obstacle.x -= state.speed;
            if (obstacle.x + obstacle.width < -20) {
                state.obstacles.splice(index, 1);
                state.score += 1;
            }
        }

        for (let index = state.collectibles.length - 1; index >= 0; index--) {
            const collectible = state.collectibles[index];
            collectible.x -= state.speed;
            if (collectible.x < -20) {
                if (!collectible.collected) {
                    for (let particleIndex = 0; particleIndex < 4; particleIndex++) {
                        state.particles.push({
                            x: collectible.x,
                            y: collectible.y,
                            vx: (Math.random() - 0.5) * 2,
                            vy: -1 - Math.random(),
                            life: 15 + Math.random() * 10,
                            maxLife: 25,
                            color: paletteRef.current.inkSoft,
                            size: 1.5 + Math.random(),
                        });
                    }
                    state.combo = 0;
                }
                state.collectibles.splice(index, 1);
            }
        }

        for (let index = state.clouds.length - 1; index >= 0; index--) {
            const cloud = state.clouds[index];
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < -10) state.clouds.splice(index, 1);
        }

        for (let index = state.particles.length - 1; index >= 0; index--) {
            const particle = state.particles[index];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            if (particle.life <= 0) state.particles.splice(index, 1);
        }

        for (let index = state.floatingTexts.length - 1; index >= 0; index--) {
            const floatingText = state.floatingTexts[index];
            floatingText.y -= 0.8;
            floatingText.life--;
            if (floatingText.life <= 0) state.floatingTexts.splice(index, 1);
        }

        if (state.affirmationTimer > 0) {
            state.affirmationTimer--;
        } else if (Math.random() < 0.002 && state.score > 5) {
            state.affirmation = PLAY_AFFIRMATIONS[Math.floor(Math.random() * PLAY_AFFIRMATIONS.length)];
            state.affirmationTimer = 120;
        }

        let collidedWithObstacle = false;
        let collisionX = 0;
        let collisionY = 0;
        const playerBox = { x: 52, y: state.playerY - 32, w: 20, h: 48 };

        for (const obstacle of state.obstacles) {
            const obstacleBox = {
                x: obstacle.x,
                y: GROUND_Y + 24 - obstacle.height,
                w: obstacle.width,
                h: obstacle.height,
            };
            if (
                playerBox.x < obstacleBox.x + obstacleBox.w - 4
                && playerBox.x + playerBox.w > obstacleBox.x + 4
                && playerBox.y + playerBox.h > obstacleBox.y + 4
                && playerBox.y < obstacleBox.y + obstacleBox.h - 4
            ) {
                collidedWithObstacle = true;
                collisionX = obstacleBox.x + obstacleBox.w / 2;
                collisionY = obstacleBox.y + obstacleBox.h / 2;
                break;
            }

            if (!obstacle.passed && obstacleBox.x + obstacleBox.w < playerBox.x) {
                obstacle.passed = true;
                const gap = playerBox.y + playerBox.h - obstacleBox.y;
                if (!obstacle.nearMissScored && gap > 0 && gap < NEAR_MISS_DISTANCE + 12 && state.isJumping) {
                    obstacle.nearMissScored = true;
                    state.score += 5;
                    state.combo = Math.min(state.combo + 1, 5);
                    state.floatingTexts.push({
                        x: playerBox.x,
                        y: playerBox.y - 6,
                        text: "Nyaris! +5",
                        life: 45,
                        maxLife: 45,
                    });
                }
            }
        }

        if (collidedWithObstacle && state.shieldFrames > 0) {
            state.shieldFrames = 0;
            state.shakeLife = 6;
            state.obstacles = state.obstacles.filter((obstacle) => !(obstacle.x < 110 && obstacle.x + obstacle.width > 40));
            const particleCount = reducedMotionRef.current ? 5 : 16;
            for (let index = 0; index < particleCount; index++) {
                state.particles.push({
                    x: collisionX,
                    y: collisionY,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 6,
                    life: 18 + Math.random() * 12,
                    maxLife: 30,
                    color: paletteRef.current.accent,
                    size: 2 + Math.random() * 3,
                });
            }
            state.floatingTexts.push({
                x: collisionX,
                y: collisionY - 10,
                text: "Perisai melindungi",
                life: 45,
                maxLife: 45,
            });
            collidedWithObstacle = false;
        }

        if (collidedWithObstacle) {
            state.shakeLife = 8;
            state.shakeX = (Math.random() - 0.5) * 10;
            state.shakeY = (Math.random() - 0.5) * 6;
            const particleCount = reducedMotionRef.current ? 5 : 14;
            for (let index = 0; index < particleCount; index++) {
                state.particles.push({
                    x: collisionX,
                    y: collisionY,
                    vx: (Math.random() - 0.5) * 7,
                    vy: (Math.random() - 0.5) * 5,
                    life: 16 + Math.random() * 10,
                    maxLife: 26,
                    color: index % 2 === 0 ? paletteRef.current.accent : paletteRef.current.obstacleDark,
                    size: 2 + Math.random() * 3,
                });
            }
        }

        if (!collidedWithObstacle) {
            for (const collectible of state.collectibles) {
                if (collectible.collected) continue;
                const dx = 72 - collectible.x;
                const dy = state.playerY - 14 - collectible.y;
                if (Math.sqrt(dx * dx + dy * dy) < 22) {
                    collectible.collected = true;
                    state.collected++;
                    state.combo++;
                    const bonus = collectible.type === "lotus" ? 5 : collectible.type === "star" ? 3 : 2;
                    state.score += bonus * Math.min(state.combo, 5);

                    if (collectible.type === "lotus") {
                        state.shieldFrames = SHIELD_DURATION_FRAMES;
                        state.floatingTexts.push({
                            x: collectible.x,
                            y: collectible.y - 24,
                            text: "Perisai aktif",
                            life: 50,
                            maxLife: 50,
                        });
                    }

                    const particleCount = reducedMotionRef.current ? 4 : 8;
                    const particleColor = collectible.type === "heart"
                        ? paletteRef.current.heart
                        : collectible.type === "star"
                            ? paletteRef.current.star
                            : paletteRef.current.accent;
                    for (let index = 0; index < particleCount; index++) {
                        state.particles.push({
                            x: collectible.x,
                            y: collectible.y,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() - 0.5) * 4,
                            life: 20 + Math.random() * 15,
                            maxLife: 35,
                            color: particleColor,
                            size: 2 + Math.random() * 3,
                        });
                    }

                    const label = collectible.type === "heart"
                        ? "Self-care"
                        : collectible.type === "star"
                            ? "Clarity"
                            : "Shield";
                    state.floatingTexts.push({
                        x: collectible.x,
                        y: collectible.y - 10,
                        text: `${label} +${bonus * Math.min(state.combo, 5)}`,
                        life: 40,
                        maxLife: 40,
                    });
                }
            }
        }

        if (!collidedWithObstacle && state.frameCount % 8 === 0) state.score++;

        if (state.shakeLife > 0) {
            state.shakeLife--;
            state.shakeX = (Math.random() - 0.5) * 8;
            state.shakeY = (Math.random() - 0.5) * 4;
        } else {
            state.shakeX = 0;
            state.shakeY = 0;
        }

        renderRunnerScene(
            context,
            paletteRef.current,
            {
                frameCount: state.frameCount,
                speed: state.speed,
                playerY: state.playerY,
                playerFrame: state.playerFrame,
                isJumping: state.isJumping,
                shieldFrames: state.shieldFrames,
                obstacles: state.obstacles,
                collectibles: state.collectibles,
                clouds: state.clouds,
                particles: state.particles,
                floatingTexts: state.floatingTexts,
                affirmation: state.affirmation,
                affirmationTimer: state.affirmationTimer,
                shakeX: state.shakeX,
                shakeY: state.shakeY,
                shakeLife: state.shakeLife,
                collided: collidedWithObstacle,
            },
            reducedMotionRef.current,
        );

        if (state.frameCount % 8 === 0 || collidedWithObstacle) syncHud();

        if (collidedWithObstacle) {
            state.running = false;
            if (state.score > state.highScore) {
                state.highScore = state.score;
                try {
                    localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(state.highScore));
                } catch {
                    // Game tetap dapat digunakan ketika storage tidak tersedia.
                }
            }
            syncHud();
            setOverMessage(GAME_OVER_MESSAGES[Math.floor(Math.random() * GAME_OVER_MESSAGES.length)]);
            setGameStatus("over");
            return;
        }

        animFrameRef.current = requestAnimationFrame(gameLoop);
    }, [syncHud]);

    const startGame = useCallback(() => {
        const state = gameStateRef.current;
        if (state.running) return;

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        let storedHighScore = state.highScore;
        try {
            const savedScore = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
            if (savedScore) storedHighScore = Math.max(storedHighScore, Number.parseInt(savedScore, 10) || 0);
        } catch {
            // Game tetap dapat digunakan ketika storage tidak tersedia.
        }

        state.running = true;
        state.score = 0;
        state.highScore = storedHighScore;
        state.speed = INITIAL_SPEED;
        state.playerY = GROUND_Y;
        state.playerVelocity = 0;
        state.isJumping = false;
        state.jumpHeld = false;
        state.jumpsUsed = 0;
        state.coyoteCounter = 0;
        state.shieldFrames = 0;
        state.playerFrame = 0;
        state.frameCount = 0;
        state.obstacles = [];
        state.collectibles = [];
        state.clouds = [
            { x: 150, y: 35, width: 70, speed: 0.4 },
            { x: 480, y: 15, width: 90, speed: 0.3 },
            { x: 860, y: 55, width: 58, speed: 0.5 },
        ];
        state.particles = [];
        state.floatingTexts = [];
        state.obstacleTravel = 0;
        state.collectibleTravel = 120;
        state.nextObstacleGap = getRandomObstacleGap();
        state.nextCollectibleGap = getRandomCollectibleGap();
        state.affirmation = "";
        state.affirmationTimer = 0;
        state.combo = 0;
        state.collected = 0;
        state.shakeX = 0;
        state.shakeY = 0;
        state.shakeLife = 0;

        setOverMessage("");
        setHud({ score: 0, highScore: storedHighScore, combo: 0, shieldSeconds: 0 });
        setGameStatus("playing");
        animFrameRef.current = requestAnimationFrame(gameLoop);
    }, [gameLoop]);

    const jump = useCallback(() => {
        const state = gameStateRef.current;
        if (!state.running) return;
        const canUseGroundJump = !state.isJumping || state.coyoteCounter > 0;
        if (canUseGroundJump && state.jumpsUsed === 0) {
            state.isJumping = true;
            state.jumpHeld = true;
            state.jumpsUsed = 1;
            state.coyoteCounter = 0;
            state.playerVelocity = JUMP_FORCE;
        } else if (state.jumpsUsed < MAX_JUMPS) {
            state.jumpHeld = true;
            state.jumpsUsed++;
            state.playerVelocity = DOUBLE_JUMP_FORCE;
        }
    }, []);

    const releaseJump = useCallback(() => {
        gameStateRef.current.jumpHeld = false;
    }, []);

    useEffect(() => {
        try {
            const savedScore = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
            const highScore = savedScore ? Number.parseInt(savedScore, 10) || 0 : 0;
            gameStateRef.current.highScore = highScore;
            setHud((current) => ({ ...current, highScore }));
        } catch {
            // High score hanya peningkatan opsional; game tetap berjalan tanpa storage.
        }
    }, []);

    useEffect(() => {
        paletteRef.current = resolveRunnerPalette(containerRef.current);
        if (!gameStateRef.current.running) {
            const context = canvasRef.current?.getContext("2d");
            if (context) renderRunnerRestingScene(context, paletteRef.current, reducedMotionRef.current);
        }
    }, [themeKey]);

    useEffect(() => {
        if (gameStatus === "playing") return;
        const context = canvasRef.current?.getContext("2d");
        if (context) renderRunnerRestingScene(context, paletteRef.current, reducedMotionRef.current);
    }, [gameStatus]);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updatePreference = () => {
            reducedMotionRef.current = mediaQuery.matches;
            if (!gameStateRef.current.running) {
                const context = canvasRef.current?.getContext("2d");
                if (context) renderRunnerRestingScene(context, paletteRef.current, mediaQuery.matches);
            }
        };
        updatePreference();
        mediaQuery.addEventListener("change", updatePreference);
        return () => mediaQuery.removeEventListener("change", updatePreference);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code !== "Space" && event.code !== "ArrowUp") return;
            const target = event.target as HTMLElement | null;
            if (target?.closest("button, a, input, textarea, select")) return;
            event.preventDefault();
            if (gameStateRef.current.running) jump();
            else startGame();
        };
        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.code === "Space" || event.code === "ArrowUp") releaseJump();
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [jump, releaseJump, startGame]);

    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    const isPlaying = gameStatus === "playing";

    return (
        <div ref={containerRef} className="space-y-3">
            <div
                className="relative overflow-hidden rounded-[1.4rem] border bg-white shadow-[0_24px_70px_-42px_rgba(15,23,42,0.5)]"
                style={{ borderColor: "var(--theme-accent-border, #fed7aa)" }}
            >
                <div className="overflow-hidden">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_W}
                        height={CANVAS_H}
                        role="img"
                        aria-describedby="mindful-runner-instructions"
                        aria-label={isPlaying ? `Mindful Runner sedang dimainkan. Skor ${hud.score}.` : "Arena Mindful Runner"}
                        className="block h-64 w-auto min-w-full max-w-none cursor-pointer select-none sm:h-80 lg:h-auto lg:w-full"
                        style={{ touchAction: "none" }}
                        onPointerDown={(event) => {
                            if (event.button !== 0) return;
                            event.preventDefault();
                            if (gameStateRef.current.running) jump();
                            else startGame();
                        }}
                        onPointerUp={releaseJump}
                        onPointerCancel={releaseJump}
                        onPointerLeave={releaseJump}
                    />
                </div>

                {isPlaying ? (
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3 sm:p-4">
                        <div className="rounded-2xl border border-white/80 bg-white/[0.82] px-3 py-2 shadow-sm backdrop-blur-md sm:px-4">
                            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px]">Skor perjalanan</p>
                            <p className="mt-0.5 text-xl font-black tabular-nums text-slate-800 sm:text-2xl">{hud.score}</p>
                        </div>
                        <div className="flex max-w-[62%] flex-wrap justify-end gap-1.5 sm:gap-2">
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/[0.82] px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-md sm:px-3">
                                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                <span className="hidden min-[390px]:inline">Terbaik</span>
                                <span className="tabular-nums text-slate-800">{hud.highScore}</span>
                            </div>
                            {hud.combo > 1 ? (
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/[0.82] px-2.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md">
                                    <Zap className="h-3.5 w-3.5" style={{ color: "var(--theme-accent, #f97316)" }} />
                                    <span className="text-slate-700">×{hud.combo}</span>
                                </div>
                            ) : null}
                            {hud.shieldSeconds > 0 ? (
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/[0.82] px-2.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md">
                                    <ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--theme-accent, #f97316)" }} />
                                    <span className="tabular-nums text-slate-700">{hud.shieldSeconds}s</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                ) : null}

                {gameStatus !== "playing" ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/5 p-3 backdrop-blur-[1px] sm:p-4">
                        <div className="pointer-events-auto max-h-[calc(100%-1rem)] w-full max-w-[20rem] overflow-y-auto overscroll-contain rounded-[1.35rem] border border-white/90 bg-white/90 p-3 text-center shadow-[0_24px_70px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:max-w-sm sm:p-5">
                            <div
                                className="mx-auto hidden h-11 w-11 items-center justify-center rounded-2xl sm:flex"
                                style={{ backgroundColor: "var(--theme-accent-light, #ffedd5)" }}
                            >
                                {gameStatus === "idle" ? (
                                    <Zap className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: "var(--theme-accent-dark, #c2410c)" }} />
                                ) : (
                                    <Heart className="h-4 w-4 text-rose-500 sm:h-5 sm:w-5" />
                                )}
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:mt-3 sm:text-[10px]">
                                {gameStatus === "idle" ? "Mindful break" : "Jeda sejenak"}
                            </p>
                            <h2 className="mt-1 text-lg font-black tracking-tight text-slate-900 sm:text-2xl">
                                {gameStatus === "idle" ? "Mulai perjalanan tenang" : "Perjalanan selesai"}
                            </h2>
                            <p className="mx-auto mt-1 max-w-[17rem] text-[11px] leading-4 text-slate-600 sm:mt-1.5 sm:text-sm sm:leading-5">
                                {gameStatus === "idle"
                                    ? "Lewati beban pikiran dan kumpulkan momen yang membuat langkahmu terasa lebih ringan."
                                    : overMessage}
                            </p>

                            {gameStatus === "over" ? (
                                <div className="mx-auto mt-2 flex max-w-52 items-center justify-center divide-x divide-slate-200 rounded-xl bg-slate-50 px-2 py-2 sm:mt-3 sm:max-w-56 sm:py-2.5">
                                    <div className="flex-1 px-2">
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Skor</p>
                                        <p className="font-black tabular-nums text-slate-800">{hud.score}</p>
                                    </div>
                                    <div className="flex-1 px-2">
                                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Terbaik</p>
                                        <p className="font-black tabular-nums text-slate-800">{hud.highScore}</p>
                                    </div>
                                </div>
                            ) : null}

                            <button
                                type="button"
                                onClick={startGame}
                                className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:mt-4 sm:h-11 sm:px-5 sm:text-sm"
                                style={{
                                    backgroundColor: "var(--theme-accent, #f97316)",
                                    boxShadow: "0 12px 28px -14px var(--theme-accent, #f97316)",
                                }}
                            >
                                {gameStatus === "idle" ? <Play className="h-4 w-4 fill-current" /> : <RotateCcw className="h-4 w-4" />}
                                {gameStatus === "idle" ? "Mulai bermain" : "Coba lagi"}
                            </button>
                        </div>
                    </div>
                ) : null}

                <p className="sr-only" aria-live="polite">
                    {gameStatus === "over" ? `Permainan selesai. Skor ${hud.score}. ${overMessage}` : ""}
                </p>
            </div>

            <div
                id="mindful-runner-instructions"
                className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-4"
            >
                <p>
                    <span className="font-semibold text-slate-700">Tahan</span> untuk melompat lebih tinggi, tekan lagi untuk lompatan ganda.
                </p>
                <div className="flex items-center gap-1.5" aria-label="Kontrol game">
                    <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-sans font-semibold text-slate-600 shadow-sm">SPASI</kbd>
                    <span>atau</span>
                    <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-sans font-semibold text-slate-600 shadow-sm">↑</kbd>
                    <span className="hidden min-[420px]:inline">atau tap</span>
                </div>
            </div>
        </div>
    );
}
