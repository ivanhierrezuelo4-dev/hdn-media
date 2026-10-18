import type { Register } from 'claude-code'

// Solo mira comandos que suben de verdad; el resto pasa sin costo.
const SUBIDA = /(upload|buffer_post)\.py/

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (!SUBIDA.test(e.command) || /--dry-run/.test(e.command)) return next(e)
    const cwd = await $.session.cwd()
    for (const py of ['python3', 'python']) {
      const r = await $.process
        .run([py, `${$.plugin.root}/qa/candado.py`, 'comando', e.command, '--cwd', cwd])
        .catch(() => undefined)
      if (!r || r.exitCode === 9009 || r.exitCode === 127) continue // ese python no existe
      return r.exitCode === 0 ? next(e) : { deny: r.stdout.trim() || r.stderr.trim() }
    }
    return { deny: `${$.plugin.name}: no hay python para revisar el QA; subida bloqueada.` }
  }).catch(($, e, next) =>
    next.called ? next(e) : { deny: `${$.plugin.name}: el candado falló; subida bloqueada.` },
  )
}
