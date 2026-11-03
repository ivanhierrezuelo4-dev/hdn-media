"""Hook PreToolUse del mod candado-audio. Exit 2 = Claude Code bloquea la acción y muestra el motivo.

Bloquea:
- Bash/PowerShell que corren upload.py o buffer_post.py run con videos sin QA PASA del archivo exacto
  (la lógica es candado.py, la misma que usan esos scripts).
- Comandos que suben por fuera de esos scripts (API de YouTube o Buffer directa).
- Buffer MCP create_post/edit_post con un video sin <video>.qa.json PASA en la carpeta de trabajo.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import candado  # noqa: E402

# Subir sin pasar por upload.py / buffer_post.py (que ya llaman al candado) no se permite.
ATAJO = re.compile(r"googleapis\.com/upload/youtube|videos\(\)\.insert|MediaFileUpload|api\.buffer\.com|createPost")
SALTAR = {"node_modules", ".git", "__pycache__", ".cache"}


def bloquear(motivo):
    sys.stderr.write("Candado de audio: bloqueado.\n" + motivo + "\n")
    sys.exit(2)


def win_paths(cmd):
    """Git Bash en Windows escribe /c/Users/...; Python de Windows necesita C:/Users/..."""
    if os.name != "nt":
        return cmd
    return re.sub(r"(^|[\s\"'=])/([a-zA-Z])/", r"\1\2:/", cmd)


def revisar_comando(cmd, cwd):
    cmd = win_paths(cmd)
    malos, scripts = [], False
    for video, err in candado.pending_from_command(cmd, cwd):
        scripts = True
        if err:
            malos.append(err)
            continue
        ok, m = candado.aprobado(video)
        if not ok:
            malos.append(m)
    if malos:
        bloquear("\n".join("- " + m for m in malos) +
                 "\nCorre primero: python candado.py check VIDEO.mp4 --guion GUION.txt (y corrige lo que diga).")
    sube_con_script = re.search(r"(upload|buffer_post)\.py", cmd)
    if ATAJO.search(cmd) and not sube_con_script and not re.search(r"\bcandado\.py\b", cmd):
        bloquear("- subida directa a YouTube/Buffer por fuera de upload.py / buffer_post.py.\n"
                 "Usa esos scripts: revisan el QA de audio antes de subir.")


def videos_en(x, en_video=False, clave=""):
    """URLs/rutas de video dentro del input de un create_post/edit_post de Buffer."""
    if isinstance(x, dict):
        return [u for k, v in x.items() for u in videos_en(v, en_video or "video" in k.lower(), k.lower())]
    if isinstance(x, list):
        return [u for v in x for u in videos_en(v, en_video)]
    if isinstance(x, str) and ((en_video and clave == "url") or re.search(r"\.(mp4|mov|m4v|webm)(\?|$)", x, re.I)):
        return [x]
    return []


def qa_pasa(nombre, raiz):
    """True si hay un <nombre>.qa.json con veredicto PASA bajo la carpeta de trabajo."""
    objetivo = nombre + ".qa.json"
    for d, dirs, files in os.walk(raiz):
        dirs[:] = [x for x in dirs if x not in SALTAR]
        if d[len(raiz):].count(os.sep) > 6:
            dirs[:] = []
        if objetivo in files:
            try:
                if json.load(open(os.path.join(d, objetivo), encoding="utf-8")).get("veredicto") == "PASA":
                    return True
            except (OSError, ValueError):
                pass
    return False


def revisar_buffer(tool_input, cwd):
    malos = []
    for u in sorted(set(videos_en(tool_input))):
        nombre = os.path.basename(u.split("?")[0])
        if not qa_pasa(nombre, cwd):
            malos.append(f"{nombre}: sin QA de audio PASA ({nombre}.qa.json) en {cwd}")
    if malos:
        bloquear("\n".join("- " + m for m in malos) + "\nCorre candado.py check sobre ese video antes de programarlo.")


RAW = ""


def main():
    global RAW
    RAW = sys.stdin.buffer.read().decode("utf-8", "replace")
    try:
        ev = json.loads(RAW)
    except ValueError:
        return 0
    tool, ti = ev.get("tool_name", ""), ev.get("tool_input") or {}
    cwd = ev.get("cwd") or os.getcwd()
    if tool in ("Bash", "PowerShell"):
        revisar_comando(ti.get("command", ""), cwd)
    elif re.search(r"buffer", tool, re.I) and re.search(r"(create|edit)_post$", tool):
        revisar_buffer(ti, cwd)
    return 0


if __name__ == "__main__":
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # Windows: consola cp1252
    except AttributeError:
        pass
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception as ex:  # si el candado falla, una subida no pasa; lo demás sí
        sys.stderr.write(f"candado-audio: error interno ({ex!r})\n")
        sys.exit(2 if re.search(r"upload\.py|buffer_post\.py|create_post|edit_post", RAW) else 1)
