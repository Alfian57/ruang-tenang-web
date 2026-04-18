"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ——— Constants ———
const CANVAS_W = 1400;
const CANVAS_H = 420;
const GROUND_Y = 330;
const GRAVITY = 0.6;
const JUMP_FORCE = -11;
const INITIAL_SPEED = 4;
const MAX_SPEED = 10;
const SPEED_INCREMENT = 0.001;
const DIFFICULTY_TIER_SCORE = 500;
const DIFFICULTY_SCALE_PER_TIER = 0.3;

// Colors (matching red mental-health theme)
const COLORS = {
    sky: "#FEF2F2",
    ground: "#FCA5A5",
    groundLine: "#EF4444",
    player: "#EF4444",
    playerAlt: "#DC2626",
    obstacle: "#6B7280",
    obstacleDark: "#374151",
    collectible: "#F87171",
    collectibleGlow: "#FEE2E2",
    cloud: "#FFFFFF",
    text: "#111827",
    textLight: "#6B7280",
    sun: "#FBBF24",
    sunGlow: "#FEF3C7",
    flower: "#F472B6",
    flowerCenter: "#FBBF24",
    leaf: "#34D399",
    heart: "#EF4444",
    star: "#FBBF24",
};

// Motivational messages when game ends
const GAME_OVER_MESSAGES = [
    "Setiap langkah kecil tetap berarti 💛",
    "Istirahat juga bagian dari perjalanan",
    "Kamu sudah berusaha dengan baik hari ini",
    "Jatuh bukan berarti gagal, coba lagi ya",
    "Kamu lebih kuat dari yang kamu kira",
    "Tidak apa-apa, ambil napas dan coba lagi",
    "Semangat! Ketenangan ada di setiap langkah",
    "Perjalananmu unik dan berharga",
];

// Affirmations that appear while playing
const PLAY_AFFIRMATIONS = [
    "Kamu hebat!",
    "Tetap tenang ✨",
    "Terus melangkah",
    "Kamu berharga 💛",
    "Hari ini indah",
    "Napas dalam...",
    "Kamu kuat 💪",
    "Semangat!",
];

interface Obstacle {
    x: number;
    width: number;
    height: number;
    type: "thought" | "stress" | "spiral";
    label: string;
}

interface Collectible {
    x: number;
    y: number;
    type: "heart" | "star" | "lotus";
    collected: boolean;
}

interface Cloud {
    x: number;
    y: number;
    width: number;
    speed: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

interface FloatingText {
    x: number;
    y: number;
    text: string;
    life: number;
    maxLife: number;
}

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

function getRandomObstacleGap() {
    return 180 + Math.random() * 200;
}

function getRandomCollectibleGap() {
    return 250 + Math.random() * 300;
}

export default function MindfulRunnerGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameStateRef = useRef({
        running: false,
        score: 0,
        highScore: 0,
        speed: INITIAL_SPEED,
        // Player
        playerY: GROUND_Y,
        playerVelocity: 0,
        isJumping: false,
        playerFrame: 0,
        frameCount: 0,
        // Entities
        obstacles: [] as Obstacle[],
        collectibles: [] as Collectible[],
        clouds: [] as Cloud[],
        particles: [] as Particle[],
        floatingTexts: [] as FloatingText[],
        // Timing
        obstacleTravel: 0,
        collectibleTravel: 0,
        nextObstacleGap: getRandomObstacleGap(),
        nextCollectibleGap: getRandomCollectibleGap(),
        // Affirmation
        affirmation: "",
        affirmationTimer: 0,
        // Combo
        combo: 0,
        collected: 0,
        // Screen feedback
        shakeX: 0,
        shakeY: 0,
        shakeLife: 0,
    });
    const animFrameRef = useRef<number>(0);
    const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "over">("idle");
    const [displayScore, setDisplayScore] = useState(0);
    const [displayHighScore, setDisplayHighScore] = useState(0);
    const [overMessage, setOverMessage] = useState("");

    // ——— Drawing helpers ———
    const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, y: number, frame: number) => {
        const x = 60;
        const bobY = gameStateRef.current.isJumping ? 0 : Math.sin(frame * 0.1) * 3;
        const pY = y + bobY;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.beginPath();
        ctx.ellipse(x + 12, GROUND_Y + 24, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = COLORS.player;
        ctx.beginPath();
        ctx.arc(x + 12, pY - 8, 10, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.fillStyle = COLORS.playerAlt;
        ctx.beginPath();
        ctx.arc(x + 12, pY - 24, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (closed / mindful)
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + 9, pY - 25, 2, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 15, pY - 25, 2, 0, Math.PI);
        ctx.stroke();

        // Smile
        ctx.beginPath();
        ctx.arc(x + 12, pY - 22, 3, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Legs walking animation
        if (!gameStateRef.current.isJumping) {
            const legAngle = Math.sin(frame * 0.25) * 0.5;
            ctx.strokeStyle = COLORS.player;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + 8, pY + 2);
            ctx.lineTo(x + 8 + Math.sin(legAngle) * 8, pY + 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 16, pY + 2);
            ctx.lineTo(x + 16 + Math.sin(-legAngle) * 8, pY + 20);
            ctx.stroke();
        } else {
            // Tucked legs in jump
            ctx.strokeStyle = COLORS.player;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x + 8, pY + 2);
            ctx.lineTo(x + 4, pY + 12);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 16, pY + 2);
            ctx.lineTo(x + 20, pY + 12);
            ctx.stroke();
        }

        // Arms
        ctx.strokeStyle = COLORS.playerAlt;
        ctx.lineWidth = 2.5;
        if (gameStateRef.current.isJumping) {
            // Arms up
            ctx.beginPath();
            ctx.moveTo(x + 4, pY - 10);
            ctx.lineTo(x - 4, pY - 20);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 20, pY - 10);
            ctx.lineTo(x + 28, pY - 20);
            ctx.stroke();
        } else {
            const armSwing = Math.sin(frame * 0.25) * 6;
            ctx.beginPath();
            ctx.moveTo(x + 4, pY - 10);
            ctx.lineTo(x - 2 + armSwing, pY + 4);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 20, pY - 10);
            ctx.lineTo(x + 26 - armSwing, pY + 4);
            ctx.stroke();
        }
    }, []);

    const drawObstacle = useCallback((ctx: CanvasRenderingContext2D, obs: Obstacle) => {
        const bx = obs.x;
        const by = GROUND_Y + 24 - obs.height;

        // Dark thought cloud shape
        ctx.fillStyle = COLORS.obstacle;
        ctx.beginPath();
        if (obs.type === "spiral") {
            // Spiral obstacle
            ctx.arc(bx + obs.width / 2, by + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
            ctx.fill();
            // Spiral lines
            ctx.strokeStyle = COLORS.obstacleDark;
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                const r = (obs.width / 2) * (0.3 + i * 0.2);
                ctx.beginPath();
                ctx.arc(bx + obs.width / 2, by + obs.height / 2, r, i * 0.5, i * 0.5 + Math.PI);
                ctx.stroke();
            }
        } else if (obs.type === "stress") {
            // Jagged stress bolt
            const cx = bx + obs.width / 2;
            ctx.moveTo(cx - 5, by);
            ctx.lineTo(cx + 8, by + obs.height * 0.35);
            ctx.lineTo(cx + 2, by + obs.height * 0.35);
            ctx.lineTo(cx + 10, by + obs.height);
            ctx.lineTo(cx - 3, by + obs.height * 0.55);
            ctx.lineTo(cx + 3, by + obs.height * 0.55);
            ctx.closePath();
            ctx.fill();
        } else {
            // Thought bubble
            const w = obs.width;
            const h = obs.height;
            ctx.roundRect(bx, by, w, h, 8);
            ctx.fill();
            ctx.fillStyle = COLORS.obstacleDark;
            ctx.beginPath();
            ctx.arc(bx + 8, by + h + 4, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(bx + 2, by + h + 10, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Label
        ctx.fillStyle = "#FFF";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(obs.label, bx + obs.width / 2, by + obs.height / 2 + 3);
        ctx.textAlign = "left";
    }, []);

    const drawCollectible = useCallback((ctx: CanvasRenderingContext2D, c: Collectible, frame: number) => {
        if (c.collected) return;
        const bob = Math.sin(frame * 0.08 + c.x) * 4;
        const cx = c.x;
        const cy = c.y + bob;

        // Glow
        ctx.fillStyle = COLORS.collectibleGlow;
        ctx.globalAlpha = 0.3 + Math.sin(frame * 0.1) * 0.15;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        if (c.type === "heart") {
            ctx.fillStyle = COLORS.heart;
            ctx.beginPath();
            ctx.moveTo(cx, cy + 4);
            ctx.bezierCurveTo(cx - 8, cy - 4, cx - 8, cy - 10, cx, cy - 6);
            ctx.bezierCurveTo(cx + 8, cy - 10, cx + 8, cy - 4, cx, cy + 4);
            ctx.fill();
        } else if (c.type === "star") {
            ctx.fillStyle = COLORS.star;
            drawStar(ctx, cx, cy, 5, 8, 4);
        } else {
            // Lotus flower
            ctx.fillStyle = COLORS.flower;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
                ctx.ellipse(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, 5, 3, a, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = COLORS.flowerCenter;
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }, []);

    // ——— Game loop ———
    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const gs = gameStateRef.current;
        if (!gs.running) return;

        gs.frameCount++;

        // Update speed
        const difficultyTier = Math.floor(gs.score / DIFFICULTY_TIER_SCORE);
        const scaledSpeedIncrement = SPEED_INCREMENT * (1 + difficultyTier * DIFFICULTY_SCALE_PER_TIER);
        gs.speed = Math.min(MAX_SPEED, gs.speed + scaledSpeedIncrement);

        // ——— Update player ———
        if (gs.isJumping) {
            gs.playerVelocity += GRAVITY;
            gs.playerY += gs.playerVelocity;
            if (gs.playerY >= GROUND_Y) {
                gs.playerY = GROUND_Y;
                gs.isJumping = false;
                gs.playerVelocity = 0;
            }
        }
        gs.playerFrame++;

        gs.obstacleTravel += gs.speed;
        gs.collectibleTravel += gs.speed;

        // ——— Spawn obstacles ———
        if (gs.obstacleTravel >= gs.nextObstacleGap) {
            const types: Obstacle["type"][] = ["thought", "stress", "spiral"];
            const type = types[Math.floor(Math.random() * types.length)];
            const w = type === "spiral" ? 28 : 30 + Math.random() * 20;
            const h = type === "stress" ? 40 + Math.random() * 15 : 25 + Math.random() * 20;
            gs.obstacles.push({
                x: CANVAS_W + 20,
                width: w,
                height: h,
                type,
                label: OBSTACLE_LABELS[Math.floor(Math.random() * OBSTACLE_LABELS.length)],
            });
            gs.obstacleTravel = 0;
            gs.nextObstacleGap = getRandomObstacleGap();
        }

        // ——— Spawn collectibles ———
        if (gs.collectibleTravel >= gs.nextCollectibleGap) {
            const types: Collectible["type"][] = ["heart", "star", "lotus"];
            gs.collectibles.push({
                x: CANVAS_W + 20,
                y: GROUND_Y - 20 - Math.random() * 60,
                type: types[Math.floor(Math.random() * types.length)],
                collected: false,
            });
            gs.collectibleTravel = 0;
            gs.nextCollectibleGap = getRandomCollectibleGap();
        }

        // ——— Spawn clouds ———
        if (gs.clouds.length < 4 && Math.random() < 0.005) {
            gs.clouds.push({
                x: CANVAS_W + 50,
                y: 20 + Math.random() * 60,
                width: 40 + Math.random() * 60,
                speed: 0.3 + Math.random() * 0.5,
            });
        }

        // ——— Update obstacles ———
        for (let i = gs.obstacles.length - 1; i >= 0; i--) {
            gs.obstacles[i].x -= gs.speed;
            if (gs.obstacles[i].x + gs.obstacles[i].width < -20) {
                gs.obstacles.splice(i, 1);
                gs.score += 1;
            }
        }

        // ——— Update collectibles ———
        for (let i = gs.collectibles.length - 1; i >= 0; i--) {
            const collectible = gs.collectibles[i];
            collectible.x -= gs.speed;
            if (collectible.x < -20) {
                if (!collectible.collected) {
                    for (let j = 0; j < 4; j++) {
                        gs.particles.push({
                            x: collectible.x,
                            y: collectible.y,
                            vx: (Math.random() - 0.5) * 2,
                            vy: -1 - Math.random(),
                            life: 15 + Math.random() * 10,
                            maxLife: 25,
                            color: "#9CA3AF",
                            size: 1.5 + Math.random(),
                        });
                    }
                    gs.combo = 0;
                }
                gs.collectibles.splice(i, 1);
            }
        }

        // ——— Update clouds ———
        for (let i = gs.clouds.length - 1; i >= 0; i--) {
            gs.clouds[i].x -= gs.clouds[i].speed;
            if (gs.clouds[i].x + gs.clouds[i].width < -10) {
                gs.clouds.splice(i, 1);
            }
        }

        // ——— Update particles ———
        for (let i = gs.particles.length - 1; i >= 0; i--) {
            const p = gs.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) gs.particles.splice(i, 1);
        }

        // ——— Update floating texts ———
        for (let i = gs.floatingTexts.length - 1; i >= 0; i--) {
            const ft = gs.floatingTexts[i];
            ft.y -= 0.8;
            ft.life--;
            if (ft.life <= 0) gs.floatingTexts.splice(i, 1);
        }

        // ——— Affirmation timer ———
        if (gs.affirmationTimer > 0) {
            gs.affirmationTimer--;
        } else if (Math.random() < 0.002 && gs.score > 5) {
            gs.affirmation = PLAY_AFFIRMATIONS[Math.floor(Math.random() * PLAY_AFFIRMATIONS.length)];
            gs.affirmationTimer = 120;
        }

        // ——— Collision: obstacles ———
        let collidedWithObstacle = false;
        let collisionX = 0;
        let collisionY = 0;
        const playerBox = { x: 52, y: gs.playerY - 32, w: 20, h: 48 };
        for (const obs of gs.obstacles) {
            const obsBox = { x: obs.x, y: GROUND_Y + 24 - obs.height, w: obs.width, h: obs.height };
            if (
                playerBox.x < obsBox.x + obsBox.w - 4 &&
                playerBox.x + playerBox.w > obsBox.x + 4 &&
                playerBox.y + playerBox.h > obsBox.y + 4 &&
                playerBox.y < obsBox.y + obsBox.h - 4
            ) {
                collidedWithObstacle = true;
                collisionX = obsBox.x + obsBox.w / 2;
                collisionY = obsBox.y + obsBox.h / 2;
                break;
            }
        }

        if (collidedWithObstacle) {
            gs.shakeLife = 8;
            gs.shakeX = (Math.random() - 0.5) * 10;
            gs.shakeY = (Math.random() - 0.5) * 6;

            for (let i = 0; i < 14; i++) {
                gs.particles.push({
                    x: collisionX,
                    y: collisionY,
                    vx: (Math.random() - 0.5) * 7,
                    vy: (Math.random() - 0.5) * 5,
                    life: 16 + Math.random() * 10,
                    maxLife: 26,
                    color: i % 2 === 0 ? COLORS.player : COLORS.obstacleDark,
                    size: 2 + Math.random() * 3,
                });
            }
        }

        // ——— Collision: collectibles ———
        if (!collidedWithObstacle) {
            for (const c of gs.collectibles) {
                if (c.collected) continue;
                const dx = 72 - c.x;
                const dy = gs.playerY - 14 - c.y;
                if (Math.sqrt(dx * dx + dy * dy) < 22) {
                    c.collected = true;
                    gs.collected++;
                    gs.combo++;
                    const bonus = c.type === "lotus" ? 5 : c.type === "star" ? 3 : 2;
                    gs.score += bonus * Math.min(gs.combo, 5);

                    // Spawn particles
                    for (let i = 0; i < 8; i++) {
                        gs.particles.push({
                            x: c.x,
                            y: c.y,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() - 0.5) * 4,
                            life: 20 + Math.random() * 15,
                            maxLife: 35,
                            color: c.type === "heart" ? COLORS.heart : c.type === "star" ? COLORS.star : COLORS.flower,
                            size: 2 + Math.random() * 3,
                        });
                    }

                    // Floating text
                    const label = c.type === "heart" ? "❤️" : c.type === "star" ? "⭐" : "🪷";
                    gs.floatingTexts.push({
                        x: c.x,
                        y: c.y - 10,
                        text: `${label} +${bonus * Math.min(gs.combo, 5)}`,
                        life: 40,
                        maxLife: 40,
                    });
                }
            }
        }

        // ——— Score tick ———
        if (!collidedWithObstacle && gs.frameCount % 8 === 0) {
            gs.score++;
            setDisplayScore(gs.score);
        }

        // Update screen shake
        if (gs.shakeLife > 0) {
            gs.shakeLife--;
            gs.shakeX = (Math.random() - 0.5) * 8;
            gs.shakeY = (Math.random() - 0.5) * 4;
        } else {
            gs.shakeX = 0;
            gs.shakeY = 0;
        }

        // ——————— DRAW ———————
        ctx.save();
        if (gs.shakeLife > 0) {
            ctx.translate(gs.shakeX, gs.shakeY);
        }

        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        skyGrad.addColorStop(0, "#EFF6FF");
        skyGrad.addColorStop(1, COLORS.sky);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Sun
        ctx.fillStyle = COLORS.sunGlow;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(CANVAS_W - 80, 50, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = COLORS.sun;
        ctx.beginPath();
        ctx.arc(CANVAS_W - 80, 50, 18, 0, Math.PI * 2);
        ctx.fill();

        // Clouds
        for (const cloud of gs.clouds) {
            ctx.fillStyle = COLORS.cloud;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.3, cloud.y - 5, cloud.width * 0.25, 0, Math.PI * 2);
            ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Ground
        ctx.fillStyle = COLORS.ground;
        ctx.fillRect(0, GROUND_Y + 24, CANVAS_W, CANVAS_H - GROUND_Y - 24);

        // Ground line
        ctx.strokeStyle = COLORS.groundLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 24);
        ctx.lineTo(CANVAS_W, GROUND_Y + 24);
        ctx.stroke();

        // Ground dots (scrolling)
        ctx.fillStyle = COLORS.groundLine;
        ctx.globalAlpha = 0.3;
        const scrollOffset = (gs.frameCount * gs.speed) % 20;
        for (let i = -1; i < CANVAS_W / 20 + 1; i++) {
            ctx.beginPath();
            ctx.arc(i * 20 - scrollOffset, GROUND_Y + 40, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Small flowers on ground
        for (let i = 0; i < 5; i++) {
            const fx = ((i * 173 + 50 - gs.frameCount * gs.speed * 0.3) % (CANVAS_W + 100)) - 50;
            ctx.fillStyle = COLORS.leaf;
            ctx.fillRect(fx, GROUND_Y + 18, 2, 6);
            ctx.fillStyle = i % 2 === 0 ? COLORS.flower : COLORS.collectible;
            ctx.beginPath();
            ctx.arc(fx + 1, GROUND_Y + 16, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Collectibles
        for (const c of gs.collectibles) {
            drawCollectible(ctx, c, gs.frameCount);
        }

        // Obstacles
        for (const obs of gs.obstacles) {
            drawObstacle(ctx, obs);
        }

        // Player
        drawPlayer(ctx, gs.playerY, gs.playerFrame);

        // Particles
        for (const p of gs.particles) {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Floating texts
        for (const ft of gs.floatingTexts) {
            ctx.globalAlpha = ft.life / ft.maxLife;
            ctx.font = "bold 14px sans-serif";
            ctx.fillStyle = COLORS.text;
            ctx.textAlign = "center";
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.textAlign = "left";
        }
        ctx.globalAlpha = 1;

        // Affirmation
        if (gs.affirmationTimer > 0 && gs.affirmation) {
            const alpha = gs.affirmationTimer > 100 ? (120 - gs.affirmationTimer) / 20 : gs.affirmationTimer > 20 ? 1 : gs.affirmationTimer / 20;
            ctx.globalAlpha = Math.min(1, alpha);
            ctx.font = "bold 18px sans-serif";
            ctx.fillStyle = COLORS.player;
            ctx.textAlign = "center";
            ctx.fillText(gs.affirmation, CANVAS_W / 2, 40);
            ctx.textAlign = "left";
            ctx.globalAlpha = 1;
        }

        // Score HUD
        ctx.font = "bold 14px sans-serif";
        ctx.fillStyle = COLORS.text;
        ctx.fillText(`Skor: ${gs.score}`, 12, 22);
        if (gs.highScore > 0) {
            ctx.fillStyle = COLORS.textLight;
            ctx.font = "11px sans-serif";
            ctx.fillText(`Terbaik: ${gs.highScore}`, 12, 38);
        }
        if (gs.combo > 1) {
            ctx.fillStyle = COLORS.collectible;
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(`Combo x${gs.combo}`, 12, 54);
        }

        if (collidedWithObstacle) {
            ctx.fillStyle = "rgba(239, 68, 68, 0.14)";
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        }

        ctx.restore();

        if (collidedWithObstacle) {
            gs.running = false;
            if (gs.score > gs.highScore) {
                gs.highScore = gs.score;
                try {
                    localStorage.setItem("mindful-runner-high-score", String(gs.highScore));
                } catch {
                    // ignore storage errors
                }
            }
            setDisplayScore(gs.score);
            setDisplayHighScore(gs.highScore);
            setOverMessage(GAME_OVER_MESSAGES[Math.floor(Math.random() * GAME_OVER_MESSAGES.length)]);
            setGameStatus("over");
            return;
        }

        animFrameRef.current = requestAnimationFrame(gameLoop);
    }, [drawPlayer, drawObstacle, drawCollectible]);

    // ——— Start / Restart ———
    const startGame = useCallback(() => {
        const gs = gameStateRef.current;
        if (gs.running) return;

        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
        }

        let hs = gs.highScore;
        try {
            const saved = localStorage.getItem("mindful-runner-high-score");
            if (saved) hs = Math.max(hs, parseInt(saved, 10) || 0);
        } catch {
            // ignore
        }

        gs.running = true;
        gs.score = 0;
        gs.highScore = hs;
        gs.speed = INITIAL_SPEED;
        gs.playerY = GROUND_Y;
        gs.playerVelocity = 0;
        gs.isJumping = false;
        gs.playerFrame = 0;
        gs.frameCount = 0;
        gs.obstacles = [];
        gs.collectibles = [];
        gs.clouds = [
            { x: 100, y: 40, width: 60, speed: 0.4 },
            { x: 350, y: 25, width: 80, speed: 0.3 },
            { x: 600, y: 55, width: 50, speed: 0.5 },
        ];
        gs.particles = [];
        gs.floatingTexts = [];
        gs.obstacleTravel = 0;
        gs.collectibleTravel = 120;
        gs.nextObstacleGap = getRandomObstacleGap();
        gs.nextCollectibleGap = getRandomCollectibleGap();
        gs.affirmation = "";
        gs.affirmationTimer = 0;
        gs.combo = 0;
        gs.collected = 0;
        gs.shakeX = 0;
        gs.shakeY = 0;
        gs.shakeLife = 0;

        setDisplayScore(0);
        setGameStatus("playing");
        animFrameRef.current = requestAnimationFrame(gameLoop);
    }, [gameLoop]);

    const jump = useCallback(() => {
        const gs = gameStateRef.current;
        if (!gs.isJumping && gs.running) {
            gs.isJumping = true;
            gs.playerVelocity = JUMP_FORCE;
        }
    }, []);

    // ——— Input handlers ———
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.code === "Space" || e.code === "ArrowUp") {
                e.preventDefault();
                if (gameStateRef.current.running) {
                    jump();
                } else {
                    startGame();
                }
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [jump, startGame]);

    // Cleanup animation frame on unmount
    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // ——— Draw idle / game-over screen ———
    useEffect(() => {
        if (gameStatus === "playing") return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        skyGrad.addColorStop(0, "#EFF6FF");
        skyGrad.addColorStop(1, COLORS.sky);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Sun
        ctx.fillStyle = COLORS.sunGlow;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(CANVAS_W - 80, 50, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = COLORS.sun;
        ctx.beginPath();
        ctx.arc(CANVAS_W - 80, 50, 18, 0, Math.PI * 2);
        ctx.fill();

        // Ground
        ctx.fillStyle = COLORS.ground;
        ctx.fillRect(0, GROUND_Y + 24, CANVAS_W, CANVAS_H - GROUND_Y - 24);
        ctx.strokeStyle = COLORS.groundLine;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y + 24);
        ctx.lineTo(CANVAS_W, GROUND_Y + 24);
        ctx.stroke();

        // Player standing
        drawPlayer(ctx, GROUND_Y, 0);

        // Text
        ctx.textAlign = "center";

        if (gameStatus === "idle") {
            ctx.font = "bold 24px sans-serif";
            ctx.fillStyle = COLORS.player;
            ctx.fillText("🧘 Mindful Runner", CANVAS_W / 2, 100);
            ctx.font = "14px sans-serif";
            ctx.fillStyle = COLORS.textLight;
            ctx.fillText("Hindari pikiran negatif, kumpulkan ketenangan", CANVAS_W / 2, 125);
            ctx.font = "bold 14px sans-serif";
            ctx.fillStyle = COLORS.text;
            ctx.fillText("Tekan SPASI atau TAP untuk mulai", CANVAS_W / 2, 160);
        } else {
            ctx.font = "bold 22px sans-serif";
            ctx.fillStyle = COLORS.player;
            ctx.fillText("Permainan Selesai", CANVAS_W / 2, 80);
            ctx.font = "16px sans-serif";
            ctx.fillStyle = COLORS.textLight;
            ctx.fillText(overMessage, CANVAS_W / 2, 108);
            ctx.font = "bold 18px sans-serif";
            ctx.fillStyle = COLORS.text;
            ctx.fillText(`Skor: ${displayScore}`, CANVAS_W / 2, 140);
            if (displayHighScore > 0) {
                ctx.font = "14px sans-serif";
                ctx.fillStyle = COLORS.textLight;
                ctx.fillText(`Skor Terbaik: ${displayHighScore}`, CANVAS_W / 2, 162);
            }
            ctx.font = "bold 13px sans-serif";
            ctx.fillStyle = COLORS.text;
            ctx.fillText("Tekan SPASI atau TAP untuk coba lagi", CANVAS_W / 2, 192);
        }
        ctx.textAlign = "left";
    }, [gameStatus, drawPlayer, displayScore, displayHighScore, overMessage]);

    return (
        <div className="flex flex-col items-center gap-3">
            <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className="rounded-xl border border-red-200 shadow-md cursor-pointer w-full h-auto"
                style={{ touchAction: "none" }}
                onClick={() => {
                    if (gameStateRef.current.running) {
                        jump();
                    } else {
                        startGame();
                    }
                }}
                onTouchStart={(e) => {
                    e.preventDefault();
                    if (gameStateRef.current.running) {
                        jump();
                    } else {
                        startGame();
                    }
                }}
            />
            <p className="text-xs text-gray-400 text-center">
                SPASI / ↑ / Tap untuk lompat • Hindari pikiran negatif, kumpulkan hati & bintang
            </p>
        </div>
    );
}

// Helper: draw a star shape
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
}
