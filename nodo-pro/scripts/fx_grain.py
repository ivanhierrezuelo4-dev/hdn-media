"""Genera public/fx/grain0..3.png (una sola vez). Uso: python scripts/fx_grain.py"""
import os
import numpy as np
from PIL import Image

os.makedirs("public/fx", exist_ok=True)
for i in range(4):
    n = np.random.default_rng(i).normal(128, 42, (960, 540)).clip(0, 255).astype("uint8")
    Image.fromarray(n, "L").save(f"public/fx/grain{i}.png")
print("ok public/fx/grain0..3.png")
