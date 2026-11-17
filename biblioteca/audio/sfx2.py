"""SFX v2 de Hecho de Nada: 20 efectos NUEVOS hechos 100 % con código (numpy), sin archivos de terceros.
No repiten los de scripts/synth.py (pop, impact, whoosh, ding, bells, glitch, alert, crack, tick, scratch,
charge_up, error_buzz, glide, riser).

Uso:
  python sfx2.py                 -> escribe sfx/<nombre>.wav (48 kHz, mono, 16 bit, pico -3 dBFS)
  from sfx2 import SFX2; y = SFX2['trueno']()   -> np.ndarray float32 en [-1, 1] (para mezclar en make.py)
"""
import os
import sys
import wave

import numpy as np

SR = 48000
RNG = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=0.2, curve=4.0):
    """envolvente ataque lineal + caída exponencial"""
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, x - a) / max(r, 1e-4))
    return e


def noise(d):
    return RNG.uniform(-1, 1, int(SR * d))


def lp(x, k):
    """paso bajo de un polo (k 0..1, menor = más oscuro)"""
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += k * (v - acc)
        y[i] = acc
    return y


def lp_sweep(x, k0, k1):
    ks = np.linspace(k0, k1, len(x))
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += ks[i] * (v - acc)
        y[i] = acc
    return y


def sine_sweep(f0, f1, d, curve='exp'):
    t = t_(d)
    if curve == 'exp':
        f = f0 * (f1 / f0) ** (t / d)
    else:
        f = np.linspace(f0, f1, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def norm(y, peak_db=-3.0):
    y = y - np.mean(y)
    m = np.max(np.abs(y)) or 1.0
    y = y / m * (10 ** (peak_db / 20))
    fade = min(len(y), int(0.004 * SR))
    y[-fade:] *= np.linspace(1, 0, fade)
    return y.astype(np.float32)


# ------------------------------------------------------------------ efectos
def trueno():
    d = 3.0
    n = noise(d)
    y = lp(n, 0.02) * env(len(n), 0.02, 1.2, 2.5) * 6
    crack = lp(noise(0.25), 0.4) * env(int(0.25 * SR), 0.001, 0.06, 6)
    y[: len(crack)] += crack * 0.8
    rumble = sum(lp(noise(d), 0.008) * env(len(n), 0.2 + i * 0.3, 0.8, 3) for i in range(3)) * 5
    return norm(y + rumble)


def rayo_zap():
    d = 0.45
    t = t_(d)
    saw = 2 * ((t * 90 * (1 + 6 * np.exp(-t * 18))) % 1) - 1
    buzz = np.sign(np.sin(2 * np.pi * 1600 * t)) * (RNG.uniform(0, 1, len(t)) > 0.6)
    return norm((saw * 0.6 + buzz * 0.4) * env(len(t), 0.001, 0.12, 3))


def gota():
    d = 0.18
    y = sine_sweep(500, 1600, d) * env(int(d * SR), 0.001, 0.05, 5)
    return norm(y)


def burbujas():
    d = 1.4
    y = np.zeros(int(d * SR))
    for _ in range(14):
        s = int(RNG.uniform(0, d - 0.12) * SR)
        f0 = RNG.uniform(300, 900)
        b = sine_sweep(f0, f0 * 2.2, 0.08) * env(int(0.08 * SR), 0.001, 0.03, 5)
        y[s : s + len(b)] += b * RNG.uniform(0.4, 1)
    return norm(y)


def _zumbido(f0, d, depth):
    t = t_(d)
    f = f0 * (1 + depth * np.sin(2 * np.pi * 3.1 * t) + 0.02 * np.sin(2 * np.pi * 11 * t))
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1) - 1
    y = lp(saw, 0.25)
    e = np.minimum(1, t / 0.1) * np.minimum(1, (d - t) / 0.2)
    pan = 0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t)  # se acerca y se aleja
    return norm(y * e * pan)


def zumbido_abeja():
    return _zumbido(190, 2.0, 0.04)


def zumbido_mosca():
    return _zumbido(330, 2.0, 0.12)


def latido():
    d = 1.6
    y = np.zeros(int(d * SR))
    for s, a in [(0.0, 1.0), (0.22, 0.7), (0.8, 1.0), (1.02, 0.7)]:
        b = sine_sweep(70, 40, 0.16) * env(int(0.16 * SR), 0.004, 0.05, 4)
        i = int(s * SR)
        y[i : i + len(b)] += b * a
    return norm(lp(y, 0.3))


def remolino():
    d = 2.2
    n = noise(d)
    y = lp_sweep(n, 0.4, 0.02) * np.minimum(1, t_(d) / 0.1) * np.exp(-t_(d) * 0.8)
    gurgle = np.sin(2 * np.pi * np.cumsum(220 + 120 * np.sin(2 * np.pi * 7 * t_(d))) / SR) * 0.15 * np.exp(-t_(d) * 1.5)
    return norm(y + gurgle)


def viento_frio():
    d = 3.0
    t = t_(d)
    n = noise(d)
    y = lp_sweep(n, 0.03, 0.08) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.4 * t)) * np.minimum(1, t / 0.6) * np.minimum(1, (d - t) / 0.6)
    whistle = np.sin(2 * np.pi * np.cumsum(900 + 200 * np.sin(2 * np.pi * 0.5 * t)) / SR) * 0.05
    return norm(y + whistle * np.minimum(1, t / 1.0))


def brillo():
    d = 0.9
    y = np.zeros(int(d * SR))
    for i, f in enumerate([2093, 2637, 3136, 4186, 3520]):
        b = np.sin(2 * np.pi * f * t_(0.4)) * env(int(0.4 * SR), 0.001, 0.12, 4)
        s = int(i * 0.07 * SR)
        y[s : s + len(b)] += b * 0.6
    return norm(y)


def boing():
    d = 0.6
    t = t_(d)
    f = 180 + 140 * np.exp(-t * 6) * np.sin(2 * np.pi * 9 * t)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.25, 3))


def squish():
    d = 0.35
    n = lp_sweep(noise(d), 0.5, 0.05)
    tone = sine_sweep(400, 120, d) * 0.4
    return norm((n + tone) * env(int(d * SR), 0.01, 0.1, 4))


def glug():
    d = 1.0
    y = np.zeros(int(d * SR))
    for i in range(4):
        b = sine_sweep(140 + i * 10, 320, 0.12) * env(int(0.12 * SR), 0.005, 0.05, 4)
        s = int(i * 0.22 * SR)
        y[s : s + len(b)] += b
    return norm(lp(y, 0.4))


def escalofrio():
    d = 1.0
    t = t_(d)
    y = np.sin(2 * np.pi * 620 * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 22 * t))) + 0.3 * np.sin(2 * np.pi * 930 * t)
    return norm(lp(y, 0.3) * env(len(t), 0.02, 0.4, 3))


def crecer():
    d = 0.8
    y = sine_sweep(220, 880, d) + 0.4 * sine_sweep(330, 1320, d)
    return norm(y * np.minimum(1, t_(d) / 0.05) * np.minimum(1, (d - t_(d)) / 0.08))


def encoger():
    d = 0.8
    y = sine_sweep(880, 180, d) + 0.4 * sine_sweep(1320, 270, d)
    return norm(y * np.minimum(1, t_(d) / 0.05) * np.minimum(1, (d - t_(d)) / 0.08))


def pasos_arena():
    d = 1.6
    y = np.zeros(int(d * SR))
    for i in range(4):
        b = lp(noise(0.14), 0.15) * env(int(0.14 * SR), 0.01, 0.05, 4)
        s = int((0.1 + i * 0.36) * SR)
        y[s : s + len(b)] += b
    return norm(y)


def bostezo():
    """'aaah' sin voz: formantes que bajan (tono de dibujo animado, no humano)"""
    d = 1.4
    t = t_(d)
    f0 = 260 * (1 - 0.35 * t / d)
    src = 2 * ((np.cumsum(f0) / SR) % 1) - 1
    y = lp_sweep(src, 0.35, 0.08) * np.sin(np.pi * t / d) ** 0.8
    return norm(y)


def campana_correcto():
    d = 1.2
    y = np.zeros(int(d * SR))
    for s, f in [(0.0, 784), (0.12, 1175)]:
        tt = t_(d - s)
        b = (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.76 * tt)) * np.exp(-tt * 4)
        i = int(s * SR)
        y[i : i + len(b)] += b
    return norm(y)


SFX2 = {
    f.__name__: f
    for f in [
        trueno, rayo_zap, gota, burbujas, zumbido_abeja, zumbido_mosca, latido, remolino, viento_frio, brillo,
        boing, squish, glug, escalofrio, crecer, encoger, pasos_arena, bostezo, campana_correcto,
    ]
}


def write_wav(path, y):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
    os.makedirs(out, exist_ok=True)
    for name, fn in SFX2.items():
        y = fn()
        write_wav(os.path.join(out, f'{name}.wav'), y)
        print(f'{name:18s} {len(y) / SR:4.2f} s')
