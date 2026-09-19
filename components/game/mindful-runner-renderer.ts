export const CANVAS_W = 1400;
export const CANVAS_H = 560;
export const GROUND_Y = 445;

export interface RunnerPalette {
    accent: string;
    accentDark: string;
    accentLight: string;
    accentSoft: string;
    accentBorder: string;
    skyTop: string;
    skyBottom: string;
    horizonBack: string;
    horizonFront: string;
    path: string;
    pathDeep: string;
    ink: string;
    inkSoft: string;
    obstacle: string;
    obstacleDark: string;
    white: string;
    heart: string;
    star: string;
}

export interface RunnerObstacle {
    x: number;
    width: number;
    height: number;
    type: "thought" | "stress" | "spiral";
    label: string;
    passed?: boolean;
    nearMissScored?: boolean;
}

export interface RunnerCollectible {
    x: number;
    y: number;
    type: "heart" | "star" | "lotus";
    collected: boolean;
}

export interface RunnerCloud {
    x: number;
    y: number;
    width: number;
    speed: number;
}

export interface RunnerParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

export interface RunnerFloatingText {
    x: number;
    y: number;
    text: string;
    life: number;
    maxLife: number;
}

export interface RunnerScene {
    frameCount: number;
    speed: number;
    playerY: number;
    playerFrame: number;
    isJumping: boolean;
    shieldFrames: number;
    obstacles: RunnerObstacle[];
    collectibles: RunnerCollectible[];
    clouds: RunnerCloud[];
    particles: RunnerParticle[];
    floatingTexts: RunnerFloatingText[];
    affirmation: string;
    affirmationTimer: number;
    shakeX: number;
    shakeY: number;
    shakeLife: number;
    collided: boolean;
}

const FALLBACK_PALETTE: RunnerPalette = {
    accent: "#f97316",
    accentDark: "#c2410c",
    accentLight: "#ffedd5",
    accentSoft: "#fff7ed",
    accentBorder: "#fed7aa",
    skyTop: "#f8fafc",
    skyBottom: "#fffaf4",
    horizonBack: "#e2e8f0",
    horizonFront: "#cbd5e1",
    path: "#f8fafc",
    pathDeep: "#e2e8f0",
    ink: "#334155",
    inkSoft: "#64748b",
    obstacle: "#64748b",
    obstacleDark: "#334155",
    white: "#ffffff",
    heart: "#fb7185",
    star: "#fbbf24",
};

const PLAYER_X = 72;

function getCssToken(style: CSSStyleDeclaration, name: string, fallback: string) {
    return style.getPropertyValue(name).trim() || fallback;
}

export function resolveRunnerPalette(element: HTMLElement | null): RunnerPalette {
    if (!element || typeof window === "undefined") return FALLBACK_PALETTE;

    const style = window.getComputedStyle(element);
    const accent = getCssToken(style, "--theme-accent", FALLBACK_PALETTE.accent);
    const accentDark = getCssToken(style, "--theme-accent-dark", FALLBACK_PALETTE.accentDark);
    const accentLight = getCssToken(style, "--theme-accent-light", FALLBACK_PALETTE.accentLight);
    const accentSoft = getCssToken(style, "--theme-accent-soft", FALLBACK_PALETTE.accentSoft);
    const accentBorder = getCssToken(style, "--theme-accent-border", FALLBACK_PALETTE.accentBorder);

    return {
        ...FALLBACK_PALETTE,
        accent,
        accentDark,
        accentLight,
        accentSoft,
        accentBorder,
        skyBottom: accentSoft,
        horizonBack: accentLight,
        horizonFront: accentBorder,
    };
}

function drawBackdrop(
    ctx: CanvasRenderingContext2D,
    palette: RunnerPalette,
    frame: number,
    speed: number,
    clouds: RunnerCloud[],
    reducedMotion: boolean,
) {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y + 40);
    sky.addColorStop(0, palette.skyTop);
    sky.addColorStop(0.62, palette.skyBottom);
    sky.addColorStop(1, palette.white);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Halo yang lembut, menggantikan matahari literal agar netral di semua tema.
    const halo = ctx.createRadialGradient(CANVAS_W - 170, 95, 8, CANVAS_W - 170, 95, 92);
    halo.addColorStop(0, palette.accentLight);
    halo.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(CANVAS_W - 280, 0, 230, 210);
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = palette.white;
    ctx.beginPath();
    ctx.arc(CANVAS_W - 170, 95, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const backOffset = reducedMotion ? 0 : (frame * speed * 0.045) % 360;
    ctx.fillStyle = palette.horizonBack;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(-360 - backOffset, GROUND_Y + 24);
    for (let i = -1; i < 6; i++) {
        const x = i * 360 - backOffset;
        ctx.quadraticCurveTo(x + 90, GROUND_Y - 150, x + 180, GROUND_Y - 54);
        ctx.quadraticCurveTo(x + 270, GROUND_Y + 5, x + 360, GROUND_Y - 42);
    }
    ctx.lineTo(CANVAS_W, GROUND_Y + 24);
    ctx.closePath();
    ctx.fill();

    const frontOffset = reducedMotion ? 0 : (frame * speed * 0.09) % 280;
    ctx.fillStyle = palette.horizonFront;
    ctx.globalAlpha = 0.28;
    ctx.beginPath();
    ctx.moveTo(-280 - frontOffset, GROUND_Y + 24);
    for (let i = -1; i < 7; i++) {
        const x = i * 280 - frontOffset;
        ctx.quadraticCurveTo(x + 70, GROUND_Y - 72, x + 140, GROUND_Y - 30);
        ctx.quadraticCurveTo(x + 215, GROUND_Y + 8, x + 280, GROUND_Y - 18);
    }
    ctx.lineTo(CANVAS_W, GROUND_Y + 24);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    for (const cloud of clouds) {
        ctx.save();
        ctx.translate(cloud.x, cloud.y + 60);
        ctx.strokeStyle = palette.white;
        ctx.lineWidth = Math.max(9, cloud.width * 0.13);
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.72;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(cloud.width * 0.2, -18, cloud.width * 0.42, 16, cloud.width * 0.62, -2);
        ctx.bezierCurveTo(cloud.width * 0.75, -14, cloud.width * 0.9, 2, cloud.width, -4);
        ctx.stroke();
        ctx.restore();
    }

    const path = ctx.createLinearGradient(0, GROUND_Y + 24, 0, CANVAS_H);
    path.addColorStop(0, palette.path);
    path.addColorStop(1, palette.pathDeep);
    ctx.fillStyle = path;
    ctx.fillRect(0, GROUND_Y + 24, CANVAS_W, CANVAS_H - GROUND_Y - 24);

    ctx.strokeStyle = palette.accent;
    ctx.globalAlpha = 0.32;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y + 24);
    ctx.lineTo(CANVAS_W, GROUND_Y + 24);
    ctx.stroke();

    const trailOffset = reducedMotion ? 0 : (frame * speed * 0.55) % 64;
    ctx.strokeStyle = palette.inkSoft;
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (let x = -64; x < CANVAS_W + 64; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x - trailOffset, GROUND_Y + 64);
        ctx.lineTo(x + 22 - trailOffset, GROUND_Y + 64);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawPlayer(
    ctx: CanvasRenderingContext2D,
    palette: RunnerPalette,
    y: number,
    frame: number,
    isJumping: boolean,
    shieldFrames: number,
    reducedMotion: boolean,
) {
    const bob = !isJumping && !reducedMotion ? Math.sin(frame * 0.1) * 2 : 0;
    const py = y + bob;
    const groundDistance = Math.max(0, GROUND_Y - y);
    const shadowScale = Math.max(0.45, 1 - groundDistance / 180);

    ctx.save();
    ctx.fillStyle = palette.ink;
    ctx.globalAlpha = 0.12 * shadowScale;
    ctx.beginPath();
    ctx.ellipse(PLAYER_X, GROUND_Y + 25, 23 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (shieldFrames > 0) {
        const pulse = reducedMotion ? 0.72 : 0.68 + Math.sin(frame * 0.16) * 0.08;
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = palette.accentLight;
        ctx.beginPath();
        ctx.arc(PLAYER_X, py - 11, 39, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(PLAYER_X, py - 11, 34, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    const stride = isJumping ? 0 : Math.sin(frame * 0.24);
    const armSwing = isJumping ? -5 : stride * 7;

    // Scarf menjadi aksen tema utama pada siluet yang tetap netral.
    ctx.save();
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(PLAYER_X - 3, py - 19);
    ctx.bezierCurveTo(
        PLAYER_X - 17,
        py - 17,
        PLAYER_X - 25 - Math.abs(stride) * 4,
        py - 11,
        PLAYER_X - 34,
        py - 17 + stride * 2,
    );
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = palette.ink;
    ctx.fillStyle = palette.ink;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";

    // Kaki dan lengan digambar terlebih dahulu agar badan terasa utuh.
    ctx.beginPath();
    ctx.moveTo(PLAYER_X - 5, py + 3);
    ctx.lineTo(PLAYER_X - 7 + stride * 8, py + 23);
    ctx.moveTo(PLAYER_X + 5, py + 3);
    ctx.lineTo(PLAYER_X + 8 - stride * 8, py + 23);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(PLAYER_X - 8, py - 12);
    ctx.lineTo(PLAYER_X - 17 + armSwing, py + (isJumping ? -23 : 4));
    ctx.moveTo(PLAYER_X + 8, py - 12);
    ctx.lineTo(PLAYER_X + 17 - armSwing, py + (isJumping ? -23 : 4));
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(PLAYER_X - 10, py - 22, 20, 29, 10);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(PLAYER_X, py - 35, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = palette.white;
    ctx.globalAlpha = 0.76;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(PLAYER_X + 2, py - 34, 3.5, 0.1 * Math.PI, 0.82 * Math.PI);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawObstacle(ctx: CanvasRenderingContext2D, palette: RunnerPalette, obstacle: RunnerObstacle) {
    const x = obstacle.x;
    const y = GROUND_Y + 24 - obstacle.height;
    const cx = x + obstacle.width / 2;
    const cy = y + obstacle.height / 2;

    ctx.save();
    ctx.fillStyle = palette.ink;
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.ellipse(cx, GROUND_Y + 27, obstacle.width * 0.58, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (obstacle.type === "spiral") {
        ctx.fillStyle = palette.obstacle;
        ctx.beginPath();
        ctx.arc(cx, cy, obstacle.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = palette.accentLight;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 4.2; angle += 0.16) {
            const radius = 1.6 + angle * 0.9;
            const px = cx + Math.cos(angle) * radius;
            const py = cy + Math.sin(angle) * radius;
            if (angle === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    } else if (obstacle.type === "stress") {
        ctx.fillStyle = palette.obstacle;
        const barHeight = Math.max(7, obstacle.height / 5);
        for (let i = 0; i < 3; i++) {
            const inset = i === 1 ? 0 : 5;
            ctx.beginPath();
            ctx.roundRect(x + inset, y + i * (barHeight + 4), obstacle.width - inset * 2, barHeight, 6);
            ctx.fill();
        }
        ctx.strokeStyle = palette.accentLight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + obstacle.height - 8);
        ctx.lineTo(cx - 3, y + obstacle.height - 15);
        ctx.lineTo(cx + 3, y + obstacle.height - 5);
        ctx.lineTo(x + obstacle.width - 7, y + obstacle.height - 12);
        ctx.stroke();
    } else {
        ctx.fillStyle = palette.obstacle;
        ctx.beginPath();
        ctx.roundRect(x, y + 5, obstacle.width, obstacle.height - 5, Math.min(14, obstacle.height / 2));
        ctx.fill();
        ctx.strokeStyle = palette.accentLight;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 7, cy + 2);
        ctx.bezierCurveTo(x + 12, cy - 8, cx - 4, cy + 10, cx, cy);
        ctx.bezierCurveTo(cx + 5, cy - 10, x + obstacle.width - 13, cy + 8, x + obstacle.width - 7, cy - 2);
        ctx.stroke();
    }

    const labelWidth = Math.max(58, Math.min(92, obstacle.label.length * 5.8 + 18));
    ctx.fillStyle = palette.white;
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.roundRect(cx - labelWidth / 2, y - 25, labelWidth, 18, 9);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = palette.accentBorder;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = palette.obstacleDark;
    ctx.font = "600 9px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(obstacle.label, cx, y - 13);
    ctx.textAlign = "left";
    ctx.restore();
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 7);
    ctx.bezierCurveTo(cx - 12, cy - 1, cx - 11, cy - 12, cx, cy - 7);
    ctx.bezierCurveTo(cx + 11, cy - 12, cx + 12, cy - 1, cx, cy + 7);
    ctx.fill();
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
    ctx.fillStyle = color;
    let rotation = -Math.PI / 2;
    const step = Math.PI / 5;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? 10 : 4.5;
        const x = cx + Math.cos(rotation) * radius;
        const y = cy + Math.sin(rotation) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        rotation += step;
    }
    ctx.closePath();
    ctx.fill();
}

function drawShield(ctx: CanvasRenderingContext2D, cx: number, cy: number, palette: RunnerPalette) {
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 11);
    ctx.lineTo(cx + 10, cy - 7);
    ctx.lineTo(cx + 8, cy + 5);
    ctx.quadraticCurveTo(cx, cy + 13, cx, cy + 13);
    ctx.quadraticCurveTo(cx, cy + 13, cx - 8, cy + 5);
    ctx.lineTo(cx - 10, cy - 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = palette.white;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy + 7);
    ctx.stroke();
}

function drawCollectible(
    ctx: CanvasRenderingContext2D,
    palette: RunnerPalette,
    collectible: RunnerCollectible,
    frame: number,
    reducedMotion: boolean,
) {
    if (collectible.collected) return;
    const bob = reducedMotion ? 0 : Math.sin(frame * 0.08 + collectible.x) * 4;
    const cx = collectible.x;
    const cy = collectible.y + bob;

    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = collectible.type === "heart" ? palette.heart : collectible.type === "star" ? palette.star : palette.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = palette.white;
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (collectible.type === "heart") drawHeart(ctx, cx, cy, palette.heart);
    else if (collectible.type === "star") drawStar(ctx, cx, cy, palette.star);
    else drawShield(ctx, cx, cy, palette);
    ctx.restore();
}

function drawEffects(ctx: CanvasRenderingContext2D, palette: RunnerPalette, scene: RunnerScene) {
    for (const particle of scene.particles) {
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const text of scene.floatingTexts) {
        ctx.globalAlpha = text.life / text.maxLife;
        ctx.fillStyle = palette.ink;
        ctx.font = "700 14px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(text.text, text.x, text.y);
    }
    ctx.textAlign = "left";
    ctx.globalAlpha = 1;

    if (scene.affirmationTimer > 0 && scene.affirmation) {
        const alpha = scene.affirmationTimer > 100
            ? (120 - scene.affirmationTimer) / 20
            : scene.affirmationTimer > 20
                ? 1
                : scene.affirmationTimer / 20;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = palette.accentDark;
        ctx.font = "700 18px ui-sans-serif, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(scene.affirmation, CANVAS_W / 2, 62);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
    }
}

export function renderRunnerScene(
    ctx: CanvasRenderingContext2D,
    palette: RunnerPalette,
    scene: RunnerScene,
    reducedMotion: boolean,
) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.save();
    if (scene.shakeLife > 0 && !reducedMotion) ctx.translate(scene.shakeX, scene.shakeY);

    drawBackdrop(ctx, palette, scene.frameCount, scene.speed, scene.clouds, reducedMotion);
    for (const collectible of scene.collectibles) {
        drawCollectible(ctx, palette, collectible, scene.frameCount, reducedMotion);
    }
    for (const obstacle of scene.obstacles) drawObstacle(ctx, palette, obstacle);
    drawPlayer(
        ctx,
        palette,
        scene.playerY,
        scene.playerFrame,
        scene.isJumping,
        scene.shieldFrames,
        reducedMotion,
    );
    drawEffects(ctx, palette, scene);

    if (scene.collided) {
        ctx.fillStyle = palette.heart;
        ctx.globalAlpha = 0.1;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.globalAlpha = 1;
    }
    ctx.restore();
}

export function renderRunnerRestingScene(
    ctx: CanvasRenderingContext2D,
    palette: RunnerPalette,
    reducedMotion: boolean,
) {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    drawBackdrop(ctx, palette, 0, 0, [], reducedMotion);
    drawPlayer(ctx, palette, GROUND_Y, 0, false, 0, reducedMotion);
}
