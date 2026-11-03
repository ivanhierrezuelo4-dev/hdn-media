"""Candado de audio + QA por código para los Shorts de Hecho de Nada. 0 tokens: no llama a ninguna IA.

  python candado.py setup                                  # una vez: baja el ASR (Parakeet, desde GitHub)
  python candado.py check VIDEO.mp4 --guion GUION [--subs SUBS] [--no-arreglar]
      Mide el video final y deja VIDEO.mp4.qa.json con veredicto PASA o BLOQUEA (exit 0 / 2).
      GUION: .txt con el texto leído, o .json (junta los textos de voz que encuentre).
      SUBS:  .srt, .vtt o .json [{start, end, text}] con los subtítulos quemados (opcional).
  python candado.py gate VIDEO.mp4 [...]                   # exit 0 solo si hay QA PASA de ESE archivo exacto
  python candado.py comando "<comando bash>" [--cwd DIR]   # lo usa el mod: bloquea subidas sin QA

Solo BLOQUEA fallos técnicos medibles. Lo creativo nunca bloquea: a lo sumo AVISO.
"""
import argparse, hashlib, json, os, re, shlex, subprocess, sys, time, unicodedata
from difflib import SequenceMatcher

VERSION = 1
MODEL_URL = ("https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/"
             "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2")
MODEL_DIR = os.path.join(os.path.expanduser("~"), ".cache", "hdn-qa",
                         "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8")

# Umbrales (cambiar aquí, nunca dentro de los chequeos)
LUFS = (-16.0, -12.0)
PICO = (-1.0, 0.0)         # dBTP: aviso, bloquea (0 = recorta/satura)
AAC_SEGURO = ["-af", "alimiter=limit=0.56:level=false", "-c:a", "aac", "-cutoff", "16000"]  # el AAC a 128k sube picos ~3 dB
VOZ_INICIO = (0.5, 1.0)    # s hasta la 1.ª palabra: aviso, bloquea
HUECO = (1.0, 2.0)         # s entre palabras: aviso, bloquea
COLA_AVISO = 2.5           # s tras la última palabra
SILENCIO_DIGITAL = 1.0     # s de silencio total (< -50 dB) = corte de audio
SUBS_DESFASE = (0.15, 0.30)  # s: aviso, bloquea
COBERTURA = (0.92, 0.80)   # palabras del guion oídas: aviso por debajo, bloquea por debajo
EXTRA_SEGUIDAS = 4         # palabras ajenas al guion seguidas a mitad = bloquea
DURACION = (5.0, 180.0)    # s fuera de esto bloquea (límite Short/Reel)
DURACION_AVISO = (20.0, 60.0)
AAC_MAX_KBPS = 128         # Instagram
INSTRUCCION = re.compile(r"\b(di|lee|habla|narra|pronuncia)\b.{0,40}\b(espanol|tono|voz|estilo|ritmo|acento)\b"
                         r"|\ben espanol de (mexico|latinoamerica|espana)\b|\bcon (un )?tono\b|\bcon voz\b"
                         r"|\bnarrador\b|\binstruccion")

NUM_WORDS = set("cero uno una dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince "
                "dieciseis diecisiete dieciocho diecinueve veinte treinta cuarenta cincuenta sesenta setenta "
                "ochenta noventa cien ciento mil millon millones primero primera segundo segunda tercero tercera".split())


# ---------- utilidades ----------
def run(argv):
    return subprocess.run(argv, capture_output=True, text=True)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", w)


def tokens(text):
    out = []
    for t in re.split(r"[\s\-–—/]+", text):
        n = norm(t)
        if n:
            out.append(n)
    return out


def same(a, b):
    if a == b:
        return True
    if (a.isdigit() or a in NUM_WORDS) and (b.isdigit() or b in NUM_WORDS):
        return True  # "3" vs "tres": el ASR escribe números con cifras
    return len(a) > 2 and len(b) > 2 and SequenceMatcher(None, a, b).ratio() >= 0.75


def record_path(video):
    return video + ".qa.json"


# ---------- guion y subtítulos ----------
VOICE_KEYS = {"vo", "voz", "voice", "texto", "text", "narracion", "guion", "say", "line", "linea", "dialogo"}


def load_guion(path):
    raw = open(path, encoding="utf-8").read()
    if not path.lower().endswith(".json"):
        return raw
    found = []

    def walk(x, key=None):
        if isinstance(x, dict):
            for k, v in x.items():
                walk(v, k.lower())
        elif isinstance(x, list):
            for v in x:
                walk(v, key)
        elif isinstance(x, str) and key in VOICE_KEYS:
            found.append(x)
    walk(json.loads(raw))
    if not found:
        sys.exit(f"{path}: no encontré textos de voz (claves {sorted(VOICE_KEYS)}); pásalo como .txt")
    return "\n".join(found)


def ts(s):
    h, m, rest = s.replace(",", ".").split(":") if s.count(":") == 2 else ("0", *s.replace(",", ".").split(":"))
    return int(h) * 3600 + int(m) * 60 + float(rest)


def load_subs(path, duration):
    raw = open(path, encoding="utf-8").read()
    subs = []
    if path.lower().endswith(".json"):
        data = json.loads(raw)
        if isinstance(data, dict):
            data = next((v for v in data.values() if isinstance(v, list)), [])
        for c in data:
            st = c.get("start", c.get("startMs", c.get("from")))
            tx = c.get("text", c.get("texto", ""))
            if st is not None and tx:
                subs.append([float(st), tx])
        if subs and max(s[0] for s in subs) > duration + 5:  # vienen en ms
            subs = [[s / 1000, t] for s, t in subs]
    else:
        for block in re.split(r"\n\s*\n", raw):
            m = re.search(r"([\d:.,]+)\s*-->\s*([\d:.,]+)", block)
            if m:
                text = block[m.end():].strip()
                subs.append([ts(m.group(1)), re.sub(r"<[^>]+>", "", text)])
    return subs


# ---------- medición ----------
def probe(video):
    p = run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", video])
    if p.returncode:
        sys.exit(f"ffprobe no pudo leer {video}: {p.stderr[:300]}")
    return json.loads(p.stdout)


def loudness(video):
    err = run(["ffmpeg", "-nostats", "-hide_banner", "-i", video, "-map", "0:a:0",
               "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    tail = err[err.rfind("Summary:"):]
    get = lambda pat: float(re.search(pat, tail).group(1)) if re.search(pat, tail) else None
    return get(r"I:\s+(-?[\d.]+) LUFS"), get(r"Peak:\s+(-?[\d.]+|-inf) dBFS"), get(r"LRA:\s+(-?[\d.]+) LU")


def digital_silences(video):
    err = run(["ffmpeg", "-nostats", "-hide_banner", "-i", video, "-map", "0:a:0",
               "-af", f"silencedetect=noise=-50dB:d={SILENCIO_DIGITAL}", "-f", "null", "-"]).stderr
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(starts, ends + [None] * (len(starts) - len(ends))))


def pcm16k(video):
    import numpy as np
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-map", "0:a:0", "-ac", "1", "-ar", "16000",
                          "-f", "s16le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype("float32") / 32768


def asr_words(video):
    """Palabras con tiempo (Parakeet TDT v3 vía sherpa-onnx, local)."""
    import numpy as np
    import sherpa_onnx
    if not os.path.isdir(MODEL_DIR):
        raise RuntimeError("falta el modelo ASR: corre `python candado.py setup`")
    f = lambda n: os.path.join(MODEL_DIR, n)
    rec = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f("encoder.int8.onnx"), decoder=f("decoder.int8.onnx"), joiner=f("joiner.int8.onnx"),
        tokens=f("tokens.txt"), model_type="nemo_transducer", num_threads=4)
    audio, sr = pcm16k(video), 16000
    # trozos de ~30 s cortados en el punto más callado cerca del límite
    cuts, pos = [0], 0
    while len(audio) - pos > 35 * sr:
        lo, hi = pos + 28 * sr, pos + 32 * sr
        frames = audio[lo:hi].reshape(-1, 800)
        pos = lo + int(np.argmin((frames ** 2).mean(1))) * 800 + 400
        cuts.append(pos)
    cuts.append(len(audio))
    words = []
    for a, b in zip(cuts, cuts[1:]):
        s = rec.create_stream()
        s.accept_waveform(sr, audio[a:b])
        rec.decode_stream(s)
        cur = None
        for tok, t in zip(s.result.tokens, s.result.timestamps):
            t += a / sr
            if tok.startswith("▁") or tok.startswith(" ") or cur is None:
                if cur:
                    words.append(cur)
                cur = {"w": tok.lstrip("▁ "), "start": t, "end": t + 0.08}
            else:
                cur["w"] += tok
                cur["end"] = t + 0.08
        if cur:
            words.append(cur)
    out = []
    for w in words:
        n = norm(w["w"])
        if n:
            out.append({**w, "n": n})
    return out


def align(ref, hyp):
    """Alineado global guion↔oído. Devuelve [(op, i_ref, j_hyp)] con op en ok/sub/falta/extra."""
    n, m = len(ref), len(hyp)
    INF = 10 ** 9
    D = [[INF] * (m + 1) for _ in range(n + 1)]
    D[0] = list(range(m + 1))
    for i in range(1, n + 1):
        D[i][0] = i
        for j in range(1, m + 1):
            c = 0 if same(ref[i - 1], hyp[j - 1]) else 1
            D[i][j] = min(D[i - 1][j - 1] + c, D[i - 1][j] + 1, D[i][j - 1] + 1)
    ops, i, j = [], n, m
    while i or j:
        if i and j and D[i][j] == D[i - 1][j - 1] + (0 if same(ref[i - 1], hyp[j - 1]) else 1):
            ops.append(("ok" if same(ref[i - 1], hyp[j - 1]) else "sub", i - 1, j - 1)); i -= 1; j -= 1
        elif i and D[i][j] == D[i - 1][j] + 1:
            ops.append(("falta", i - 1, None)); i -= 1
        else:
            ops.append(("extra", None, j - 1)); j -= 1
    return ops[::-1]


# ---------- chequeos ----------
class Report:
    def __init__(self):
        self.items = []

    def add(self, nivel, nombre, detalle):
        self.items.append({"nivel": nivel, "chequeo": nombre, "detalle": detalle})

    ok = lambda s, n, d: s.add("OK", n, d)
    aviso = lambda s, n, d: s.add("AVISO", n, d)
    bloquea = lambda s, n, d: s.add("BLOQUEA", n, d)

    @property
    def veredicto(self):
        return "BLOQUEA" if any(i["nivel"] == "BLOQUEA" for i in self.items) else "PASA"


def fix_audio(video):
    tmp = video + ".tmp.mp4"
    p = run(["ffmpeg", "-y", "-v", "error", "-i", video, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy",
             *AAC_SEGURO, "-b:a", f"{AAC_MAX_KBPS}k", "-movflags", "+faststart", tmp])
    if p.returncode:
        raise RuntimeError(p.stderr[:300])
    os.replace(tmp, video)


def check_format(video, r, arreglar):
    info = probe(video)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    dur = float(info["format"].get("duration", 0))
    if not v:
        r.bloquea("video", "no hay pista de video"); return dur, info
    w, h = v["width"], v["height"]
    if h < 1280 or abs(w / h - 9 / 16) > 0.01:
        r.bloquea("resolución", f"{w}x{h}: un Short debe ser vertical 9:16 (ideal 1080x1920)")
    else:
        r.ok("resolución", f"{w}x{h}")
    num, den = (int(x) for x in v.get("avg_frame_rate", "0/1").split("/"))
    fps = num / den if den else 0
    (r.ok if v["codec_name"] == "h264" and 23 <= fps <= 61 else r.aviso)("códec video", f"{v['codec_name']} {fps:.2f} fps")
    if not DURACION[0] <= dur <= DURACION[1]:
        r.bloquea("duración", f"{dur:.1f} s fuera de {DURACION[0]:.0f}-{DURACION[1]:.0f} s (Short/Reel)")
    else:
        (r.ok if DURACION_AVISO[0] <= dur <= DURACION_AVISO[1] else r.aviso)("duración", f"{dur:.1f} s")
    if not a:
        r.bloquea("audio", "no hay pista de audio"); return dur, info
    kbps = int(a.get("bit_rate") or 0) / 1000
    if a["codec_name"] != "aac" or kbps > AAC_MAX_KBPS + 2:
        if arreglar:
            fix_audio(video)
            r.ok("audio IG", f"{a['codec_name']} {kbps:.0f} kbps → recodificado a AAC {AAC_MAX_KBPS} kbps (video intacto)")
            return check_format(video, Report(), False)[0], probe(video)
        r.bloquea("audio IG", f"{a['codec_name']} {kbps:.0f} kbps: Instagram pide AAC ≤ {AAC_MAX_KBPS} kbps")
    else:
        r.ok("audio IG", f"aac {kbps:.0f} kbps {a.get('sample_rate')} Hz")
    return dur, info


def check_loudness(video, r):
    i, peak, lra = loudness(video)
    if i is None:
        r.bloquea("volumen", "no se pudo medir"); return
    msg = f"{i:.1f} LUFS, pico {peak} dBTP, LRA {lra}"
    if not LUFS[0] <= i <= LUFS[1]:
        r.bloquea("volumen", f"{msg}: fuera de {LUFS[0]}..{LUFS[1]} LUFS")
    elif peak is not None and peak > PICO[1]:
        r.bloquea("volumen", f"{msg}: pico sobre {PICO[1]} dBTP (satura)")
    elif peak is not None and peak > PICO[0]:
        r.aviso("volumen", f"{msg}: pico sobre {PICO[0]} dBTP")
    else:
        r.ok("volumen", msg)


def check_voice(words, guion, dur, r):
    ref, hyp = tokens(guion), [w["n"] for w in words]
    if not hyp:
        r.bloquea("voz", "el ASR no oyó ninguna palabra"); return
    heard = " ".join(hyp)
    m = INSTRUCCION.search(heard)
    if m and not INSTRUCCION.search(" ".join(ref)):
        r.bloquea("instrucción TTS", f"se oye texto de instrucción: «…{heard[max(0, m.start() - 30):m.end() + 30]}…»")
    ops = align(ref, hyp)
    first_ok = next(k for k, o in enumerate(ops) if o[0] in ("ok", "sub")) if any(o[0] in ("ok", "sub") for o in ops) else len(ops)
    lead = [words[o[2]] for o in ops[:first_ok] if o[0] == "extra"]
    if len(lead) >= 2 or (lead and lead[-1]["end"] - lead[0]["start"] > 0.8):
        r.bloquea("primera palabra", f"antes de «{ref[0] if ref else ''}» se oye: «{' '.join(w['w'] for w in lead)}» "
                                     f"({lead[0]['start']:.1f}-{lead[-1]['end']:.1f} s): instrucción del TTS u otro texto")
    elif not same(hyp[0], ref[0]) and not (len(ref) > 1 and same(hyp[0], ref[1])):
        r.aviso("primera palabra", f"la 1.ª voz suena «{words[0]['w']}» y el guion empieza «{ref[0]}» (posible error del ASR)")
    else:
        r.ok("primera palabra", f"«{words[0]['w']}» a {words[0]['start']:.2f} s")
    # palabras de más en medio o al final
    run_, worst, tail = [], [], []
    for o in ops[first_ok:]:
        if o[0] == "extra":
            run_.append(words[o[2]])
        else:
            if len(run_) > len(worst):
                worst = run_
            run_ = []
    tail = run_
    if len(tail) >= 2:
        r.bloquea("palabras de más", f"tras el final del guion se oye: «{' '.join(w['w'] for w in tail)}» ({tail[0]['start']:.1f} s)")
    if len(worst) >= EXTRA_SEGUIDAS:
        r.bloquea("palabras de más", f"{len(worst)} palabras seguidas fuera del guion a {worst[0]['start']:.1f} s: "
                                     f"«{' '.join(w['w'] for w in worst)}»")
    elif len(worst) >= 2:
        r.aviso("palabras de más", f"«{' '.join(w['w'] for w in worst)}» a {worst[0]['start']:.1f} s no está en el guion")
    cov = sum(o[0] == "ok" for o in ops) / max(1, len(ref))
    diffs = [f"«{ref[o[1]]}»→«{words[o[2]]['w']}»" for o in ops if o[0] == "sub"][:6]
    msg = f"{cov:.0%} del guion oído tal cual" + (f"; distinto: {', '.join(diffs)}" if diffs else "")
    if cov < COBERTURA[1]:
        r.bloquea("guion vs voz", msg + " (falta voz o el audio no es de este guion)")
    else:
        (r.ok if cov >= COBERTURA[0] else r.aviso)("guion vs voz", msg)
    # silencios de la voz
    t0 = words[0]["start"]
    (r.bloquea if t0 > VOZ_INICIO[1] else r.aviso if t0 > VOZ_INICIO[0] else r.ok)("arranque", f"primera voz a {t0:.2f} s")
    gaps = [(b["start"] - a["end"], a["end"]) for a, b in zip(words, words[1:])]
    g, at = max(gaps) if gaps else (0, 0)
    (r.bloquea if g > HUECO[1] else r.aviso if g > HUECO[0] else r.ok)("silencios", f"hueco más largo {g:.2f} s a {at:.1f} s")
    cola = dur - words[-1]["end"]
    (r.aviso if cola > COLA_AVISO else r.ok)("cola", f"{cola:.2f} s tras la última palabra")


def check_subs(subs, words, r):
    hyp, ptr, offs = [w["n"] for w in words], 0, []
    for start, text in subs:
        tk = tokens(text)
        if not tk:
            continue
        for j in range(ptr, min(len(hyp), ptr + 20)):
            if same(tk[0], hyp[j]) and (len(tk) == 1 or j + 1 >= len(hyp) or same(tk[1], hyp[j + 1])):
                offs.append((start - words[j]["start"], start, text)); ptr = j + 1
                break
    if len(offs) < max(1, len(subs) // 2):
        r.aviso("subtítulos", f"solo pude ubicar {len(offs)}/{len(subs)} subtítulos en la voz; desfase no medido")
        return
    off, at, text = max(offs, key=lambda o: abs(o[0]))
    msg = f"peor desfase {off:+.2f} s ({abs(off) * 30:.0f} frames) en «{text[:40]}» a {at:.1f} s; {len(offs)} medidos"
    (r.bloquea if abs(off) > SUBS_DESFASE[1] else r.aviso if abs(off) > SUBS_DESFASE[0] else r.ok)("subtítulos", msg)


def check(a):
    video = os.path.abspath(a.video)
    r = Report()
    dur, _ = check_format(video, r, not a.no_arreglar)
    if not any(i["chequeo"] == "audio" and i["nivel"] == "BLOQUEA" for i in r.items):
        check_loudness(video, r)
        for s, e in digital_silences(video):
            if s > 0.05 and (e is None or e < dur - 1.5):
                r.bloquea("corte de audio", f"silencio total {s:.1f}-{e if e else dur:.1f} s")
        try:
            words = asr_words(video)
        except Exception as ex:  # sin ASR no se puede asegurar que no haya instrucción leída
            words = None
            r.bloquea("voz", f"no pude transcribir ({ex}); sin transcripción no hay candado")
        if words is not None:
            check_voice(words, load_guion(a.guion), dur, r)
            if a.subs:
                check_subs(load_subs(a.subs, dur), words, r)
            elif words:
                r.aviso("subtítulos", "no pasaste --subs: desfase no medido")
    rec = {"version": VERSION, "veredicto": r.veredicto, "archivo": os.path.basename(video), "sha256": sha256(video),
           "fecha": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "guion": os.path.abspath(a.guion), "chequeos": r.items}
    json.dump(rec, open(record_path(video), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"QA {os.path.basename(video)}: {r.veredicto}")
    for i in r.items:
        print(f"- {i['nivel']}: {i['chequeo']}: {i['detalle']}")
    return 0 if r.veredicto == "PASA" else 2


# ---------- candado ----------
def aprobado(video):
    """(True, '') solo si hay QA PASA hecho sobre este archivo exacto."""
    video = os.path.abspath(video)
    if not os.path.exists(video):
        return False, f"{video}: no existe"
    try:
        rec = json.load(open(record_path(video), encoding="utf-8"))
    except (OSError, ValueError):
        return False, f"{os.path.basename(video)}: sin QA (corre: python candado.py check {video} --guion ...)"
    if rec.get("veredicto") != "PASA":
        motivos = "; ".join(i["detalle"] for i in rec.get("chequeos", []) if i["nivel"] == "BLOQUEA")
        return False, f"{os.path.basename(video)}: QA BLOQUEA: {motivos}"
    if rec.get("sha256") != sha256(video):
        return False, f"{os.path.basename(video)}: el archivo cambió después del QA; repítelo"
    return True, ""


def gate(a):
    bad = [m for ok, m in (aprobado(v) for v in a.videos) if not ok]
    for m in bad:
        print("BLOQUEADO", m)
    return 2 if bad else 0


def pending_from_command(cmd, cwd):
    """Videos que un comando de subida va a publicar. [] si no es una subida real."""
    env, here = {}, cwd
    for part in re.split(r"&&|;|\|\|", cmd):
        try:
            argv = [x.strip('"\'') for x in shlex.split(part, posix=os.name != "nt")]
        except ValueError:
            argv = part.split()
        while argv and re.match(r"^[A-Z_]+=", argv[0]):
            k, v = argv.pop(0).split("=", 1); env[k] = v
        if not argv:
            continue
        if argv[0] == "cd" and len(argv) > 1:
            here = os.path.normpath(os.path.join(here, os.path.expanduser(argv[1])))
            continue
        script = next((x for x in argv if x.endswith(("upload.py", "buffer_post.py"))), None)
        if not script or "--dry-run" in argv:
            continue
        sdir = os.path.dirname(os.path.join(here, script))
        if script.endswith("upload.py"):
            qf, base, done = os.path.join(here, "queue.json"), here, "uploaded"
        else:
            if "run" not in argv:
                continue
            qf = env.get("BUFFER_QUEUE") or os.environ.get("BUFFER_QUEUE") or os.path.join(sdir, "social_queue.json")
            qf, base, done = os.path.join(here, qf), sdir, "buffer_ids"
        try:
            queue = json.load(open(qf, encoding="utf-8"))
        except (OSError, ValueError):
            yield None, f"no pude leer la cola {qf}"
            continue
        for item in queue:
            if not item.get(done):
                yield os.path.join(base, item["file"]), None


def comando(a):
    bad = []
    for video, err in pending_from_command(a.cmd, a.cwd or os.getcwd()):
        if err:
            bad.append(err)
        else:
            ok, m = aprobado(video)
            if not ok:
                bad.append(m)
    if bad:
        print("Candado de audio: subida bloqueada.\n" + "\n".join("- " + m for m in bad))
        return 2
    return 0


def setup(_):
    if os.path.isdir(MODEL_DIR):
        print("modelo ya instalado:", MODEL_DIR); return 0
    os.makedirs(os.path.dirname(MODEL_DIR), exist_ok=True)
    tar = MODEL_DIR + ".tar.bz2"
    subprocess.run(["curl", "-sSfL", "-o", tar, MODEL_URL], check=True)
    subprocess.run(["tar", "xjf", tar, "-C", os.path.dirname(MODEL_DIR)], check=True)
    os.remove(tar)
    print("listo:", MODEL_DIR, "(además: pip install sherpa-onnx numpy)")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd_", required=True)
    sub.add_parser("setup").set_defaults(f=setup)
    c = sub.add_parser("check"); c.set_defaults(f=check)
    c.add_argument("video"); c.add_argument("--guion", required=True); c.add_argument("--subs")
    c.add_argument("--no-arreglar", action="store_true", help="no recodificar el audio a AAC 128k si hace falta")
    g = sub.add_parser("gate"); g.set_defaults(f=gate); g.add_argument("videos", nargs="+")
    k = sub.add_parser("comando"); k.set_defaults(f=comando); k.add_argument("cmd"); k.add_argument("--cwd")
    a = ap.parse_args()
    sys.exit(a.f(a))


if __name__ == "__main__":
    main()
