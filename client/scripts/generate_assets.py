#!/usr/bin/env python3
"""Generate pixel-art spritesheets for Holders vs Jeets."""

from PIL import Image, ImageDraw
import os
import random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets")
os.makedirs(OUT, exist_ok=True)

# Pixel art constants
SCALE = 1  # base 1:1, game can upscale with image-rendering: pixelated
FRAME_W = 48
FRAME_H = 48

# Palettes (limited, retro)
PALETTES = {
    "diamond_hands": ["#1a4d2e", "#4ade80", "#86efac", "#14522d", "#0f3d22"],
    "whale": ["#1e3a5f", "#60a5fa", "#93c5fd", "#172554", "#0f172a"],
    "staker": ["#713f12", "#fcd34d", "#fde047", "#451a03", "#291002"],
    "ape": ["#7c2d12", "#f97316", "#fdba74", "#4a1507", "#2b0a03"],
    "fud_bomber": ["#450a0a", "#ef4444", "#fca5a5", "#7f1d1d", "#290405"],
    "hodl_laser": ["#3b0764", "#a855f7", "#d8b4fe", "#581c87", "#24063c"],
}

JEET_PALETTES = {
    "paper_hands": ["#334155", "#94a3b8", "#cbd5e1", "#1e293b", "#0f172a"],
    "fomo_runner": ["#831843", "#f472b6", "#fbcfe8", "#500724", "#2c0313"],
    "rug_puller": ["#292524", "#78716c", "#a8a29e", "#1c1917", "#0c0a09"],
    "whale_jeet": ["#0f172a", "#1e293b", "#475569", "#020617", "#000000"],
    "bot_swarm": ["#164e63", "#22d3ee", "#a5f3fc", "#083344", "#042024"],
    "influencer": ["#581c87", "#c084fc", "#e9d5ff", "#3b0764", "#1e032e"],
}


def put_pixel(draw, x, y, color, scale=1):
    draw.rectangle([x * scale, y * scale, (x + 1) * scale - 1, (y + 1) * scale - 1], fill=color)


def draw_box_body(draw, cx, cy, w, h, colors, frame=0):
    """Draw a blocky character body centered at cx,cy with bounce frame."""
    x0, y0 = cx - w // 2, cy - h // 2 + (frame * 1)
    # shadow/base
    draw.rectangle([x0, y0, x0 + w - 1, y0 + h - 1], fill=colors[0])
    # inner highlight
    draw.rectangle([x0 + 2, y0 + 2, x0 + w - 3, y0 + h - 3], fill=colors[1])
    # lighter edge top
    draw.rectangle([x0 + 4, y0 + 4, x0 + w - 5, y0 + 8], fill=colors[2])


def draw_eyes(draw, cx, cy, look="front", angry=False):
    eye_y = cy - 6
    if look == "left":
        draw.rectangle([cx - 10, eye_y, cx - 6, eye_y + 4], fill="#000")
        draw.rectangle([cx + 2, eye_y, cx + 6, eye_y + 4], fill="#000")
    else:
        draw.rectangle([cx - 9, eye_y, cx - 5, eye_y + 4], fill="#000")
        draw.rectangle([cx + 5, eye_y, cx + 9, eye_y + 4], fill="#000")
    if angry:
        draw.rectangle([cx - 10, eye_y - 2, cx - 4, eye_y], fill="#000")
        draw.rectangle([cx + 4, eye_y - 2, cx + 10, eye_y], fill="#000")


def draw_holder_sprite(draw, cx, cy, type_name, frame=0):
    colors = PALETTES[type_name]
    body_w, body_h = 32, 36
    draw_box_body(draw, cx, cy - 4, body_w, body_h, colors, frame)
    draw_eyes(draw, cx, cy - 4)

    # Symbol on chest
    symbols = {
        "diamond_hands": "♦",
        "whale": "W",
        "staker": "S",
        "ape": "A",
        "fud_bomber": "F",
        "hodl_laser": "H",
    }
    # draw simple symbol pixel block instead of font
    sym_colors = {
        "diamond_hands": colors[2],
        "whale": colors[2],
        "staker": colors[3],
        "ape": colors[2],
        "fud_bomber": colors[2],
        "hodl_laser": colors[2],
    }
    # small 8x8 symbol square
    sx, sy = cx - 4, cy + 2
    draw.rectangle([sx, sy, sx + 7, sy + 7], fill=sym_colors[type_name])


def draw_jeet_sprite(draw, cx, cy, type_name, frame=0):
    colors = JEET_PALETTES[type_name]
    body_w, body_h = 30, 34
    bounce = frame * 1
    draw_box_body(draw, cx, cy - 2 + bounce, body_w, body_h, colors, 0)
    draw_eyes(draw, cx, cy - 2 + bounce, look="left", angry=True)

    # Jeet mouth
    mouth_y = cy + 2 + bounce
    draw.rectangle([cx - 5, mouth_y, cx + 5, mouth_y + 3], fill="#000")


def draw_projectile(draw, cx, cy, type_name):
    colors = PALETTES[type_name]
    draw.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=colors[1])
    draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=colors[2])
    # trail
    draw.rectangle([cx - 12, cy - 2, cx - 6, cy + 2], fill=colors[1])


def draw_coin(draw, cx, cy):
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill="#d97706")
    draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill="#fcd34d")
    draw.rectangle([cx - 2, cy - 5, cx + 2, cy + 5], fill="#b45309")
    draw.rectangle([cx - 1, cy - 6, cx + 1, cy - 5], fill="#b45309")
    draw.rectangle([cx - 1, cy + 5, cx + 1, cy + 6], fill="#b45309")


def draw_tile(draw, x, y, variant=0):
    base = (0x1a, 0x2d, 0x20)
    alt = (0x1e, 0x33, 0x24)
    dark = (0x14, 0x24, 0x1a)
    fill = base if (x + y) % 2 == 0 else alt
    draw.rectangle([x, y, x + FRAME_W - 1, y + FRAME_H - 1], fill=fill)
    # random grass dots
    seed = (x * 131 + y * 17 + variant) % 1000
    rng = random.Random(seed)
    for _ in range(6):
        gx = x + rng.randint(2, FRAME_W - 4)
        gy = y + rng.randint(2, FRAME_H - 4)
        draw.rectangle([gx, gy, gx + 1, gy + 1], fill=dark)


def generate():
    # 1. Holders spritesheet: 6 types x 2 frames
    holders_img = Image.new("RGBA", (FRAME_W * 2, FRAME_H * len(PALETTES)), (0, 0, 0, 0))
    holders_draw = ImageDraw.Draw(holders_img)
    holder_frames = {}
    for row, (name, _) in enumerate(PALETTES.items()):
        holder_frames[name] = (0, row, 1, row)
        for frame in range(2):
            cx = frame * FRAME_W + FRAME_W // 2
            cy = row * FRAME_H + FRAME_H // 2
            draw_holder_sprite(holders_draw, cx, cy, name, frame)
    holders_img.save(os.path.join(OUT, "holders.png"))

    # 2. Jeets spritesheet
    jeets_img = Image.new("RGBA", (FRAME_W * 2, FRAME_H * len(JEET_PALETTES)), (0, 0, 0, 0))
    jeets_draw = ImageDraw.Draw(jeets_img)
    jeet_frames = {}
    for row, (name, _) in enumerate(JEET_PALETTES.items()):
        jeet_frames[name] = (0, row, 1, row)
        for frame in range(2):
            cx = frame * FRAME_W + FRAME_W // 2
            cy = row * FRAME_H + FRAME_H // 2
            draw_jeet_sprite(jeets_draw, cx, cy, name, frame)
    jeets_img.save(os.path.join(OUT, "jeets.png"))

    # 3. Projectiles spritesheet (1 per holder)
    proj_img = Image.new("RGBA", (16 * len(PALETTES), 16), (0, 0, 0, 0))
    proj_draw = ImageDraw.Draw(proj_img)
    for idx, name in enumerate(PALETTES.keys()):
        cx = idx * 16 + 8
        cy = 8
        draw_projectile(proj_draw, cx, cy, name)
    proj_img.save(os.path.join(OUT, "projectiles.png"))

    # 4. Coin
    coin_img = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
    coin_draw = ImageDraw.Draw(coin_img)
    draw_coin(coin_draw, 12, 12)
    coin_img.save(os.path.join(OUT, "coin.png"))

    # 5. Tileset
    tiles_img = Image.new("RGBA", (FRAME_W * 4, FRAME_H * 2), (0, 0, 0, 0))
    tiles_draw = ImageDraw.Draw(tiles_img)
    for row in range(2):
        for col in range(4):
            draw_tile(tiles_draw, col * FRAME_W, row * FRAME_H, variant=row * 4 + col)
    tiles_img.save(os.path.join(OUT, "tiles.png"))

    print("Generated assets in", OUT)
    print("Holders:", list(PALETTES.keys()))
    print("Jeets:", list(JEET_PALETTES.keys()))


if __name__ == "__main__":
    generate()
