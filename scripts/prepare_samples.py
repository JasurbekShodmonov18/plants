# -*- coding: utf-8 -*-
"""
Namunaviy o'simlik barglari rasmlarini tayyorlash skripti.
Foydalanuvchi saytga kirishi bilan bir marta bosish orqali sinab ko'rishi uchun.
"""

import os
import requests
from PIL import Image, ImageDraw, ImageFilter

SAMPLES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static", "images", "samples")
os.makedirs(SAMPLES_DIR, exist_ok=True)

# Wikimedia va GitHub ochiq manbalaridagi namunalar
SAMPLE_URLS = {
    "tomato_late_blight.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Potato_late_blight.JPG/640px-Potato_late_blight.JPG",
    "apple_cedar_rust.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Gymnosporangium_juniperi-virginianae_on_Crataegus.jpg/640px-Gymnosporangium_juniperi-virginianae_on_Crataegus.jpg",
    "corn_leaf_blight.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Exserohilum_turcicum_on_maize.jpg/640px-Exserohilum_turcicum_on_maize.jpg",
    "grape_black_rot.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Guignardia_bidwellii_leaf_spot.jpg/640px-Guignardia_bidwellii_leaf_spot.jpg",
}

def create_fallback_sample(filename, title, base_color, spot_color, spot_count=12):
    """Agar internetdan yuklab bo'lmasa, yuqori sifatli sintetik barg yaratish."""
    img = Image.new("RGB", (400, 400), color=(245, 247, 245))
    draw = ImageDraw.Draw(img)
    
    # Barg shakli
    draw.ellipse([60, 40, 340, 360], fill=base_color, outline=(40, 100, 30), width=3)
    # Barg tomirlari
    draw.line([200, 40, 200, 360], fill=(50, 120, 40), width=4)
    for y in range(80, 320, 30):
        draw.line([200, y, 100, y - 20], fill=(50, 120, 40), width=2)
        draw.line([200, y, 300, y - 20], fill=(50, 120, 40), width=2)
        
    # Kasallik dog'lari
    import random
    random.seed(42)
    for _ in range(spot_count):
        sx = random.randint(110, 290)
        sy = random.randint(90, 310)
        sr = random.randint(10, 28)
        draw.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=spot_color, outline=(80, 30, 20))

    img = img.filter(ImageFilter.SMOOTH_MORE)
    img.save(os.path.join(SAMPLES_DIR, filename), "JPEG", quality=90)
    print(f"Sintetik namuna yaratildi: {filename}")

def download_or_generate():
    for filename, url in SAMPLE_URLS.items():
        filepath = os.path.join(SAMPLES_DIR, filename)
        if os.path.exists(filepath):
            continue
        try:
            print(f"Yuklanmoqda: {filename}...")
            resp = requests.get(url, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200:
                with open(filepath, "wb") as f:
                    f.write(resp.content)
                print(f"Yuklandi: {filename}")
                continue
        except Exception as e:
            print(f"Yuklab bo'lmadi ({e}), sintetik yaratiladi...")
        
        # Fallback
        if "blight" in filename:
            create_fallback_sample(filename, "Blight", (85, 140, 60), (90, 50, 30), 16)
        elif "rust" in filename:
            create_fallback_sample(filename, "Rust", (70, 150, 60), (210, 100, 20), 20)
        elif "rot" in filename:
            create_fallback_sample(filename, "Rot", (90, 155, 70), (45, 30, 25), 14)
        else:
            create_fallback_sample(filename, "Healthy", (50, 165, 60), (50, 165, 60), 0)

if __name__ == "__main__":
    download_or_generate()
