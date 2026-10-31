"""Banda sonora + efectos de 'Nodo 3.0', todo generado con código (numpy/scipy).
Capas: música (tema de Nodo, acordes, ritmo) -> bus con ducking; efectos con capas y paneo por posición;
voz de pitidos con formantes sincronizada con la boca (speech.json); reverb de convolución; master.
uso: python score.py speech.json salida.wav
"""
import json, sys, wave
import numpy as np
from scipy.signal import butter, lfilter, sosfilt, fftconvolve

SR = 48000
FPS = 30
TOTAL = 2100
N = int(TOTAL / FPS * SR) + SR
rng = np.random.default_rng(7)
SPEECH = json.load(open(sys.argv[1]))
OUT = sys.argv[2]


def fr(f):
    return int(round(f / FPS * SR))


def T(d):
    return np.arange(int(d * SR)) / SR


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def adsr(n, a=0.005, d=0.1, s=0.6, r=0.1, hold=None):
    x = np.arange(n) / SR
    hold = hold if hold is not None else n / SR - r
    e = np.where(x < a, x / max(a, 1e-4), s + (1 - s) * np.exp(-(x - a) / max(d, 1e-4)))
    rel = np.clip(1 - (x - hold) / r, 0, 1)
    return e * np.where(x > hold, rel, 1)


def lp(x, fc, o=2):
    return sosfilt(butter(o, min(fc, SR / 2 - 100) / (SR / 2), 'low', output='sos'), x)


def hp(x, fc, o=2):
    return sosfilt(butter(o, fc / (SR / 2), 'high', output='sos'), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], 'band', output='sos'), x)


def noise(d):
    return rng.normal(0, 1, int(d * SR))


def saw(f, x):
    ph = np.cumsum(np.broadcast_to(f, x.shape)) / SR if np.ndim(f) else f * x
    return 2 * (ph % 1) - 1


def glide(f0, f1, d, curve=1.0):
    x = T(d)
    k = (x / d) ** curve
    f = f0 * (f1 / f0) ** k
    return np.sin(2 * np.pi * np.cumsum(f) / SR), f


class Bus:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, sig, f, g=1.0, pan=0.0):
        i = fr(f) if not isinstance(f, tuple) else f[0]
        if i >= N:
            return
        s = sig[: N - i] * g
        pan = float(np.clip(pan, -1, 1))
        self.L[i : i + len(s)] += s * np.cos((pan + 1) * np.pi / 4) * 1.414
        self.R[i : i + len(s)] += s * np.sin((pan + 1) * np.pi / 4) * 1.414

    def add_st(self, l, r, f, g=1.0):
        i = fr(f)
        n = min(len(l), N - i)
        self.L[i : i + n] += l[:n] * g
        self.R[i : i + n] += r[:n] * g


def reverb_ir(d=2.2, damp=5000, seed=1):
    r = np.random.default_rng(seed)
    x = T(d)
    env = np.exp(-x * 6.9 / d)
    ir = []
    for _ in range(2):
        n = r.normal(0, 1, len(x)) * env
        n = lp(n, damp) + 0.3 * lp(n, 1800)
        n[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ir.append(n / np.sqrt(np.sum(n ** 2)))
    return ir


IR = reverb_ir()
IR_S = reverb_ir(1.0, 7000, 3)


def verb(bus, ir=IR, wet=0.3):
    L = fftconvolve(bus.L, ir[0])[:N]
    R = fftconvolve(bus.R, ir[1])[:N]
    return L * wet, R * wet


# ================= instrumentos =================
def kick(g=1.0):
    x = T(0.42)
    f = 46 + 120 * np.exp(-x * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 7)
    click = hp(noise(0.012), 2500) * np.exp(-T(0.012) * 400) * 0.5
    body[: len(click)] += click
    return np.tanh(body * 1.6) * g


def snare():
    x = T(0.28)
    n = bp(noise(0.28), 1200, 9000) * np.exp(-x * 16)
    tone = (np.sin(2 * np.pi * 185 * x) + 0.5 * np.sin(2 * np.pi * 330 * x)) * np.exp(-x * 30)
    return n * 0.7 + tone * 0.5


def clap():
    out = np.zeros(int(0.3 * SR))
    for k, o in enumerate([0, 0.011, 0.022, 0.034]):
        d = 0.18 if k == 3 else 0.012
        b = bp(noise(d), 900, 4000) * np.exp(-T(d) * (25 if k == 3 else 300))
        i = int(o * SR)
        out[i : i + len(b)] += b
    return out * 0.9


def hat(open_=False):
    d = 0.32 if open_ else 0.06
    x = T(d)
    n = hp(noise(d), 7000) * np.exp(-x * (9 if open_ else 70))
    return n * 0.55


def crash():
    x = T(2.4)
    n = hp(noise(2.4), 3500) * np.exp(-x * 1.8)
    ring = sum(np.sin(2 * np.pi * f * x) for f in (3150, 4270, 5530)) * 0.03 * np.exp(-x * 2)
    return n * 0.5 + ring


def bass(m, d):
    x = T(d)
    f = hz(m)
    s = saw(f, x) * 0.7 + np.sin(2 * np.pi * f * x) * 0.9
    s = lp(s, 380 + 900 * 0.5) * adsr(len(x), 0.004, 0.14, 0.55, 0.05)
    return np.tanh(s * 1.4) * 0.8


def rhodes(m, d, vel=1.0):
    x = T(d + 0.6)
    f = hz(m)
    idx = 2.2 * np.exp(-x * 5) * vel
    mod = np.sin(2 * np.pi * f * x) * idx
    car = np.sin(2 * np.pi * f * x + mod)
    bell = np.sin(2 * np.pi * f * 7.0 * x) * 0.12 * np.exp(-x * 14)
    e = adsr(len(x), 0.003, 0.9, 0.35, 0.5, hold=d)
    return (car + bell) * e * (1 + 0.12 * np.sin(2 * np.pi * 5 * x))


def pluck(m, d=0.6, bright=0.5):
    f = hz(m)
    Np = int(SR / f)
    n = len(T(d))
    exc = np.zeros(n)
    exc[:Np] = lp(rng.uniform(-1, 1, Np), 2000 + 7000 * bright)
    g = 0.996
    a = np.zeros(Np + 2)
    a[0] = 1
    a[Np] = -g / 2
    a[Np + 1] = -g / 2
    y = lfilter([1.0], a, exc)
    return y * adsr(n, 0.001, 0.4, 0.6, 0.08) * 0.8


def pad(ms, d):
    x = T(d)
    s = np.zeros(len(x))
    for m in ms:
        for det in (-0.09, 0.0, 0.1):
            s += saw(hz(m + det), x + rng.uniform(0, 1))
    s = lp(s, 1400) / (len(ms) * 3)
    a = np.minimum(1, x / 0.6) * np.minimum(1, (d - x) / 0.5)
    return s * np.clip(a, 0, 1)


def bell(m, d=1.6):
    x = T(d)
    f = hz(m)
    s = np.zeros(len(x))
    for r, a, k in ((1, 1, 2.2), (2.76, 0.45, 4), (5.4, 0.25, 7), (8.93, 0.12, 10)):
        s += np.sin(2 * np.pi * f * r * x) * a * np.exp(-x * k)
    s[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return s * 0.5


def musicbox(m, d=1.0, dull=False):
    if dull:  # la versión "plana": onda cuadrada sin vida
        x = T(0.35)
        return np.sign(np.sin(2 * np.pi * hz(m) * x)) * 0.25 * np.exp(-x * 9)
    return bell(m, d)


def lead(m, d, slide_from=None):
    x = T(d + 0.15)
    f0 = hz(m)
    f = np.full(len(x), f0)
    if slide_from is not None:
        k = np.minimum(1, x / 0.05)
        f = hz(slide_from) * (f0 / hz(slide_from)) ** k
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * x) * np.minimum(1, x / 0.25)
    ph = np.cumsum(f * vib) / SR
    s = (2 * (ph % 1) - 1) * 0.5 + np.sign(np.sin(2 * np.pi * ph)) * 0.25
    s = lp(s, 3200)
    return s * adsr(len(x), 0.01, 0.2, 0.75, 0.12, hold=d)


def stab(ms, d=0.35):
    x = T(d)
    s = sum(saw(hz(m), x) + saw(hz(m) * 1.004, x) for m in ms) / len(ms)
    return lp(s, 2600) * np.exp(-x * 7) * 0.6


# ================= efectos =================
def pop(p=1.0):
    x = T(0.1)
    f = (420 + 700 * np.exp(-x * 40)) * p
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 40)


def tick(m):
    return bell(m, 0.35) * 0.7


def whoosh(d=0.5, up=True):
    x = T(d)
    n = noise(d)
    out = np.zeros(len(x))
    seg = 256
    for i in range(0, len(x), seg):
        k = i / len(x)
        fc = 300 + 4200 * (k if up else 1 - k) ** 1.5
        out[i : i + seg] = n[i : i + seg]
    lo = bp(n, 300, 1500)
    hi = bp(n, 1500, 7000)
    k = (x / d) if up else 1 - x / d
    out = lo * (1 - k) + hi * k
    return out * np.sin(np.pi * x / d) ** 2 * 0.9


def impact():
    x = T(1.6)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 70 * np.exp(-x * 10)) / SR) * np.exp(-x * 3.2)
    crack = bp(noise(1.6), 600, 6000) * np.exp(-x * 22)
    return np.tanh((boom * 1.2 + crack * 0.8) * 1.3)


def thump():
    x = T(0.3)
    f = 65 + 75 * np.exp(-x * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 14)


def squish():
    x = T(0.16)
    n = lp(noise(0.16), 900) * np.exp(-x * 26)
    w = np.sin(2 * np.pi * np.cumsum(200 - 500 * x) / SR) * np.exp(-x * 30) * 0.4
    return n * 1.4 + w


def boing(f0=210, d=0.55, rate=None):
    x = T(d)
    rate = rate or 13
    f = f0 * (1 + 0.32 * np.sin(2 * np.pi * rate * x) * np.exp(-x * 4)) * (1 + 0.6 * x)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 5) * np.minimum(1, x / 0.004)


def squeak_up():
    s, _ = glide(500, 1100, 0.12, 0.6)
    return s * np.exp(-T(0.12) * 10) * 0.6


def bwip_q():  # "¿?" curioso
    s, _ = glide(380, 900, 0.32, 2.2)
    x = T(0.32)
    return s * np.sin(np.pi * x / 0.32) ** 0.5 * 0.8


def slide_down(d=0.9):
    x = T(d)
    f = 950 * (300 / 950) ** (x / d) * (1 + 0.025 * np.sin(2 * np.pi * 6 * x))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return s * np.minimum(1, x / 0.03) * np.minimum(1, (d - x) / 0.15) * 0.5


def zap(d=1.2):
    x = T(d)
    f = 90 + 40 * rng.standard_normal(len(x)).cumsum() / 400
    s = saw(np.clip(f, 50, 300), x)
    cr = (rng.random(len(x)) < 0.002) * rng.normal(0, 3, len(x))
    s = bp(s + lp(cr, 6000), 150, 5000)
    return np.tanh(s * 2) * 0.35 * np.minimum(1, x / 0.02) * np.minimum(1, (d - x) / 0.1)


def growl(d=0.8):
    x = T(d)
    s = saw(72, x) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * x))
    return lp(np.tanh(s * 2), 900) * np.minimum(1, x / 0.05) * np.exp(-x * 2) * 0.7


def twang(d=1.0):
    x = T(d)
    return np.sin(2 * np.pi * 170 * x + 3 * np.sin(2 * np.pi * 19 * x)) * np.exp(-x * 4) * 0.7


def gasp():
    x = T(0.35)
    n = noise(0.35)
    return bp(n, 1200, 5000) * np.sin(np.pi * x / 0.35) ** 2 * 0.5


def sparkle(base=84, n=6, sp=0.045):
    out = np.zeros(int((n * sp + 0.8) * SR))
    sc = [0, 4, 7, 12, 16, 19, 24]
    for i in range(n):
        b = bell(base + sc[i % len(sc)], 0.6) * 0.35
        j = int(i * sp * SR)
        out[j : j + len(b)] += b
    return out


def shimmer(d=1.0):
    x = T(d)
    n = hp(noise(d), 5000) * (x / d) ** 2 * 0.4
    return n + sparkle(84, 10, d / 10)[: len(x)] * 0.7


def riser(d):
    x = T(d)
    f = 180 + 1400 * (x / d) ** 2.2
    s = saw(f, x) * 0.25 + hp(noise(d), 2000) * 0.3 * (x / d)
    return lp(s, 6000) * (x / d) ** 1.5


def buzzer():
    x = T(0.3)
    return lp(np.sign(np.sin(2 * np.pi * 110 * x)) * 0.3, 1200) * np.exp(-x * 5)


def wah_flat():  # "uuh" de lo plano
    x = T(0.7)
    f = 233 * (1 - 0.06 * x)
    s = np.sign(np.sin(2 * np.pi * np.cumsum(np.full(len(x), 1.0) * f) / SR))
    return lp(s, 1000) * 0.3 * np.exp(-x * 2.5)


def hum(d):
    x = T(d)
    s = np.sin(2 * np.pi * 110 * x) + 0.5 * np.sin(2 * np.pi * 220 * x) + 0.2 * np.sin(2 * np.pi * 330 * x + 0.4)
    return s * 0.12 * (1 + 0.15 * np.sin(2 * np.pi * 3 * x)) * np.minimum(1, x / 0.3) * np.minimum(1, (d - x) / 0.3)


def click():
    x = T(0.03)
    return hp(noise(0.03), 2000) * np.exp(-x * 200) * 0.8


def fwip(p=1.0):
    d = 0.12
    x = T(d)
    n = bp(noise(d), 800 * p, 3500 * p)
    return n * np.sin(np.pi * x / d) ** 2 * 0.7


# ================= voz de Nodo (pitidos con formantes) =================
FORM = {'a': (800, 1250), 'e': (420, 2050), 'i': (300, 2350), 'o': (470, 820), 'u': (330, 700)}


def syllable(v, d, f0):
    x = T(d)
    f = f0 * (1 + 0.04 * np.sin(2 * np.pi * 7 * x)) * (1 + 0.08 * (x / d))
    src = saw(f, x) * 0.6 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4
    f1, f2 = FORM[v]
    s = bp(src, f1 * 0.8, f1 * 1.25) * 1.3 + bp(src, f2 * 0.85, f2 * 1.2) * 0.7 + src * 0.08
    e = np.minimum(1, x / 0.012) * np.minimum(1, (d - x) / 0.03)
    return s * np.clip(e, 0, 1)


# ================= composición =================
music = Bus()
sfx = Bus()
voice = Bus()
B = 15  # fotogramas por pulso (120 bpm)
PROG_F = [(41, [65, 69, 72, 76]), (38, [62, 65, 69, 72]), (46, [62, 65, 70, 74]), (48, [64, 67, 70, 72])]  # F Dm Bb C
MOTIF = [(72, 0, .5), (77, .5, .5), (79, 1, .5), (81, 1.5, 1), (79, 2.5, .5), (77, 3, 1), (77, 4, .5), (76, 4.5, .5), (74, 5, .5), (72, 5.5, 2)]


def section(a, b, parts, key=0, gain=1.0):
    """llena la música de a..b (fotogramas, alineados al compás de 60) con las partes pedidas"""
    for bar_f in range(a, b, 60):
        bi = (bar_f // 60) % 4
        root, ch = PROG_F[bi]
        root += key
        ch = [c + key for c in ch]
        if 'pad' in parts:
            music.add(pad([c - 12 for c in ch[:3]], 2.1), bar_f, 0.32 * gain)
        for k in range(4):
            fb = bar_f + k * B
            if fb >= b:
                break
            if 'kick' in parts and (k in (0, 2) or ('four' in parts)):
                music.add(kick(), fb, 0.75 * gain)
            if 'kick' in parts and k == 2 and 'four' not in parts:
                music.add(kick(), fb + 7.5 + 0, 0.45 * gain)
            if 'snare' in parts and k in (1, 3):
                music.add(snare(), fb, 0.38 * gain)
                music.add(clap(), fb, 0.22 * gain, pan=0.15)
            if 'bass' in parts:
                nt = [root, root, root + 12, root + 7][k]
                music.add(bass(nt, 0.22), fb, 0.42 * gain)
                music.add(bass(root, 0.12), fb + 10, 0.26 * gain)
            if 'rhodes' in parts and k in (0, 2):
                for j, c in enumerate(ch):
                    music.add(rhodes(c - 12, 0.9, 0.8), fb + j * 0.6, 0.11 * gain, pan=-0.25 + j * 0.15)
        for k in range(8):
            fb = bar_f + k * 7.5 + (1.3 if k % 2 else 0)  # swing
            if fb >= b:
                break
            if 'hat' in parts:
                music.add(hat(open_=(k == 7)), fb, (0.2 if k % 2 else 0.28) * gain, pan=0.35)
            if 'pluck' in parts:
                arp = [0, 1, 2, 3, 2, 1, 2, 3]
                music.add(pluck(ch[arp[k]] + 12, 0.5, 0.4 + 0.1 * (k % 3)), fb, 0.22 * gain, pan=-0.45 + 0.13 * k)


def motif(at, instr, key=0, g=0.4, pan=0.0, dull=False):
    for m, b0, d in MOTIF:
        f = at + b0 * B
        m += key
        if instr == 'box':
            music.add(musicbox(m, 1.2, dull), f, g, pan)
        elif instr == 'lead':
            music.add(lead(m, d * B / FPS), f, g, pan)
        elif instr == 'bell':
            music.add(bell(m + 12, 1.4), f, g, pan)


# --- Intro 0-150: caja de música "plana", luego el equipo
music.add(pad([53, 57, 60], 5.0), 0, 0.22)
motif(4, 'box', g=0.35, dull=True)
music.add(pad([53, 57, 60, 64], 2.6), 96, 0.3)
for i, f in enumerate([92, 100, 108, 116]):
    music.add(bell([72, 76, 79, 84][i], 1.5), f, 0.35, pan=[-0.6, 0.6, -0.3, 0.3][i])
music.add(riser(1.9), 93, 0.55)
for k in range(16):  # redoble que acelera
    f = 120 + 30 * (1 - (1 - k / 16) ** 1.6)
    music.add(snare(), f, 0.08 + 0.14 * k / 16)
# --- golpe 150 y tema
music.add(crash(), 150, 0.55)
music.add(stab([65, 69, 72, 77]), 150, 0.5)
music.add(kick(), 150, 0.9)
section(180, 540, ['kick', 'snare', 'hat', 'bass', 'rhodes', 'pluck', 'pad'])
motif(180, 'bell', g=0.22, pan=0.2)
# --- Luz 540-780: quiebre cálido
section(540, 780, ['hat', 'bass', 'rhodes', 'pad'], gain=0.9)
motif(600, 'box', g=0.28, pan=-0.2)
# --- Caras 780-1140
music.add(crash(), 780, 0.35)
section(780, 1140, ['kick', 'snare', 'hat', 'bass', 'rhodes', 'pad'])
# --- Manos 1140-1380
section(1140, 1380, ['kick', 'snare', 'hat', 'bass', 'pluck'], gain=0.9)
# --- Habla 1380-1620 (se agacha bajo la voz)
section(1380, 1620, ['kick', 'hat', 'bass', 'rhodes', 'pad'], gain=0.85)
# --- Música 1620-1860: entran los instrumentos uno a uno, cambio de tono en 1740
section(1620, 1740, ['kick', 'snare', 'hat', 'four'])
section(1650, 1740, ['bass'])
section(1680, 1740, ['rhodes', 'pad'])
motif(1710 - 0, 'lead', g=0.0)  # (marcador)
for m, b0, d in MOTIF[:4]:
    music.add(lead(m, d * B / FPS), 1710 + b0 * B, 0.2, 0.1)
music.add(riser(0.9), 1713, 0.5)
music.add(crash(), 1740, 0.6)
section(1740, 1860, ['kick', 'snare', 'hat', 'bass', 'rhodes', 'pluck', 'pad', 'four'], key=2)
motif(1740, 'lead', key=2, g=0.24, pan=0.1)
# --- Créditos 1860-2100
section(1860, 1950, ['kick', 'hat', 'bass', 'pad'], key=2, gain=0.85)
for i, f in enumerate([1875, 1890, 1905, 1920]):
    music.add(stab([67 + 2 * 0 + [0, 2, 4, 7][i], 71, 74]), f, 0.32, pan=[-0.4, 0.4, -0.2, 0.2][i])
music.add(crash(), 1950, 0.6)
music.add(kick(), 1950, 0.9)
fin = [55, 62, 67, 71, 74, 79]  # G add9
for j, m in enumerate(fin):
    music.add(rhodes(m, 3.2, 1.0), 1950 + j * 0.8, 0.14, pan=-0.4 + j * 0.16)
music.add(pad([55, 62, 67, 71], 4.2), 1950, 0.35)
music.add(bass(43, 2.0), 1950, 0.6)
motif(1980, 'bell', key=2, g=0.2, pan=-0.15)

# ================= efectos sincronizados con la animación =================
S = sfx.add
# intro
for i, f in enumerate([14, 20, 26, 32]):
    S(tick(76 + i), f, 0.12)
S(wah_flat(), 38, 0.5)
for i, f in enumerate([92, 100, 108, 116]):
    S(pop(1 + i * 0.1), f, 0.45, pan=[0.4, -0.4, -0.3, 0.3][i])
    S(whoosh(0.4), f - 4, 0.25, pan=[0.6, -0.6, -0.4, 0.4][i])
S(whoosh(0.5), 133, 0.4)
S(impact(), 150, 0.95)
S(shimmer(0.8), 150, 0.35)
S(squeak_up(), 154, 0.3)
S(thump(), 179, 0.8)
S(squish(), 179, 0.5)
S(boing(230), 180, 0.35)
S(pop(1.2), 172, 0.35)
S(pop(1.3), 178, 0.35)
S(pop(1.0), 184, 0.35, pan=-0.4)
S(pop(1.1), 190, 0.35, pan=0.4)
for k in range(5):
    S(fwip(1 + 0.1 * (k % 2)), 192 + k * 9.4, 0.15, pan=-0.45)
# antena
for c in [240, 540, 780, 1140, 1380, 1620, 1860]:
    S(whoosh(0.6), c - 10, 0.55)
for i, f in enumerate([250, 254, 258, 262]):
    S(click(), f, 0.35)
    S(tick(84 + i * 2), f, 0.12)
S(pop(0.9), 254, 0.3, pan=-0.6)
S(buzzer(), 270, 0.35, pan=-0.6)
S(squeak_up(), 262, 0.3)
S(thump(), 283, 0.75)
S(squish(), 283, 0.4)
S(boing(200, 0.9, 11), 284, 0.45)
S(pop(1.1), 270, 0.3, pan=0.5)
S(bwip_q(), 332, 0.55)
S(pop(1.0), 332, 0.3)
S(sparkle(84, 5), 376, 0.35)
for f in [401, 416]:
    S(thump(), f, 0.5)
    S(boing(260, 0.4, 15), f, 0.35)
S(slide_down(0.9), 422, 0.55)
S(rhodes(50, 0.8, 0.6), 420, 0.12)
S(zap(1.25), 465, 0.5)
S(growl(0.8), 467, 0.45)
S(twang(1.0), 502, 0.55)
S(gasp(), 500, 0.4)
S(impact(), 502, 0.5)
S(squeak_up(), 508, 0.25)
S(thump(), 529, 0.55)
S(pop(1.2), 512, 0.3)
S(pop(1.1), 336, 0.2)
# luz
for i, f in enumerate([548, 552, 556]):
    S(tick(77 + 2 * i), f, 0.15)
S(shimmer(1.1), 578, 0.45)
S(click(), 616, 0.6)
S(pop(1.3), 616, 0.3)
hd = (780 - 620) / FPS
h = hum(hd)
xs = np.arange(len(h)) / SR * FPS + 620 - 540
ang = -125 + np.clip((xs - 80) / 156, 0, 1)
ang = -125 + (0.5 - 0.5 * np.cos(np.pi * np.clip((xs - 80) / 156, 0, 1))) * 290
pan = np.cos(np.radians(ang)) * 0.85
i0 = fr(620)
sfx.L[i0 : i0 + len(h)] += h * np.cos((pan + 1) * np.pi / 4) * 1.414
sfx.R[i0 : i0 + len(h)] += h * np.sin((pan + 1) * np.pi / 4) * 1.414
for i, f in enumerate([636, 652, 668, 684]):
    S(pop(1 + 0.08 * i), f, 0.3, pan=[-0.5, 0.5, -0.4, 0.4][i])
for i, f in enumerate([690, 694, 698]):
    S(tick(84 + 2 * i), f, 0.15)
# caras
C0 = 780
S(sparkle(79, 6), C0 + 2, 0.4)
S(squeak_up(), C0, 0.25)
S(thump(), C0 + 22, 0.55)
S(boing(250, 0.4), C0 + 22, 0.3)
S(bwip_q(), C0 + 45, 0.55)
S(growl(0.9), C0 + 90, 0.55)
S(zap(0.6), C0 + 92, 0.3)
S(slide_down(1.0), C0 + 135, 0.5)
S(twang(0.9), C0 + 180, 0.5)
S(gasp(), C0 + 179, 0.45)
S(squeak_up(), C0 + 180, 0.3)
S(thump(), C0 + 202, 0.6)
S(bell(88, 0.8), C0 + 225, 0.3)
S(glide(600, 1300, 0.18, 1)[0] * 0.4, C0 + 226, 0.5)
S(stab([53, 60, 65], 0.5), C0 + 270, 0.45)
S(pad([65, 69, 72], 1.4), C0 + 315, 0.35)
for i in range(8):
    S(pop(1 + 0.05 * i), C0 + i * 45 + 2, 0.3, pan=0.0)
# manos
S(pop(1.3), 1150, 0.5, pan=-0.5)
S(pop(1.1), 1156, 0.5, pan=0.5)
for k in range(8):
    S(fwip(1 + 0.15 * (k % 2)), 1152 + k * 10.05, 0.3, pan=-0.5)
S(whoosh(0.3), 1228, 0.4, pan=0.5)
S(bell(91, 1.0), 1232, 0.35, pan=0.5)
S(pop(1.2), 1236, 0.35, pan=0.5)
S(click(), 1290, 0.5, pan=0.5)
S(bell(84, 0.8), 1291, 0.3, pan=0.5)
S(bell(88, 0.8), 1295, 0.3, pan=0.5)
S(squeak_up(), 1290, 0.2)
S(thump(), 1309, 0.5)
S(lead(67, 0.18), 1340, 0.25)
S(lead(62, 0.3), 1347, 0.25)
S(fwip(0.8), 1340, 0.3, pan=-0.6)
S(fwip(0.8), 1340, 0.3, pan=0.6)
for i, f in enumerate([1150, 1154, 1158, 1162]):
    S(tick(79 + i), f, 0.1)
# habla: voz de Nodo
voice_curve = []
for i, s in enumerate(SPEECH['syl']):
    f0 = 340 + 60 * np.sin(i * 1.7) + 30 * (i % 3)
    if i == len(SPEECH['syl']) - 1:
        f0 = 300
    d = (s['d'] + 1.5) / FPS
    voice.add(syllable(s['v'], d, f0), s['f'], 1.7, pan=-0.05)
S(pop(1.0), 1440, 0.25)
# música
for i, f in enumerate([1626, 1650, 1680, 1710]):
    S(pop(1 + 0.1 * i), f, 0.3, pan=[-0.4, 0.4, -0.4, 0.4][i])
S(impact(), 1740, 0.6)
# créditos
for i, f in enumerate([1864, 1867, 1870, 1873]):
    S(tick(79 + i * 2), f, 0.12)
for i, f in enumerate([1875, 1890, 1905, 1920]):
    S(whoosh(0.25), f - 3, 0.3)
    S(pop(1.1 + 0.1 * i), f, 0.3)
S(pop(1.0), 1940, 0.4)
S(squeak_up(), 1944, 0.3)
S(thump(), 1967, 0.6)
S(sparkle(86, 8), 1964, 0.4)
S(boing(240, 0.6), 1968, 0.3)
S(sparkle(91, 6), 1990, 0.3)

# ================= mezcla =================
def env_follow(on, att=0.004, rel=0.22):
    out = np.zeros_like(on)
    a = 1 - np.exp(-1 / (att * SR))
    r = 1 - np.exp(-1 / (rel * SR))
    # versión rápida en bloques de 64 muestras
    blk = 64
    v = 0.0
    for i in range(0, len(on), blk):
        tgt = on[i : i + blk].max()
        c = a if tgt > v else r
        v += (tgt - v) * (1 - (1 - c) ** blk)
        out[i : i + blk] = v
    return out


# 1) ducking de la música bajo la voz (-9 dB)
gate = np.zeros(N)
for s in SPEECH['syl']:
    gate[fr(s['f'] - 2) : fr(s['f'] + s['d'] + 2)] = 1
duck_v = env_follow(gate, 0.01, 0.25)
# 2) ducking leve bajo efectos fuertes (-3 dB)
sfx_env = np.abs(sfx.L) + np.abs(sfx.R)
sfx_env = env_follow(np.clip(sfx_env / 1.2, 0, 1), 0.003, 0.18)
g_music = 10 ** ((-10 * duck_v - 3 * sfx_env) / 20)

mL, mR = verb(music, IR, 0.22)
music.L = (music.L + mL) * g_music
music.R = (music.R + mR) * g_music
sL, sR = verb(sfx, IR_S, 0.18)
vL, vR = verb(voice, IR_S, 0.12)
L = music.L * 0.75 + (sfx.L + sL) * 1.35 + voice.L + vL
R = music.R * 0.75 + (sfx.R + sR) * 1.35 + voice.R + vR
L = hp(L, 35, 4)
R = hp(R, 35, 4)
np.save(OUT + '.stems.npy', np.stack([(music.L*0.75)[::1], (sfx.L+sL)[::1]*1.35, (voice.L+vL)[::1]])[:, ::4])
# master: compresión suave + saturación + techo
pk = np.max(np.abs(np.stack([L, R])))
L /= pk
R /= pk
L = np.tanh(L * 1.6) / np.tanh(1.6)
R = np.tanh(R * 1.6) / np.tanh(1.6)
# cola: fundido final
a, b = fr(2070), fr(2098)
fade = np.ones(N)
fade[a:b] = np.linspace(1, 0, b - a) ** 2
fade[b:] = 0
L *= fade
R *= fade
end = fr(TOTAL)
st = np.stack([L[:end], R[:end]], 1) * 0.89
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
np.save(OUT + '.duck.npy', duck_v[::1600])
print('ok', OUT, end / SR, 's')
