import { test, expect } from 'claude-code/testing'

test('deja pasar comandos que no suben', async ($, on) => {
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'ok', stderr: '', interrupted: false } }))
  const r = await $.tool.call({ tool: 'Bash', command: 'ls canal/yt' })
  expect(r.deny).toBeUndefined()
})

test('deja pasar el ensayo --dry-run', async ($, on) => {
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'ok', stderr: '', interrupted: false } }))
  const r = await $.tool.call({ tool: 'Bash', command: 'cd canal/yt && python upload.py --dry-run' })
  expect(r.deny).toBeUndefined()
})

test('sin poder revisar el QA, la subida se bloquea', async ($, on) => {
  on('tool.call', { tool: 'Bash' }, () => ({ result: { stdout: 'subido', stderr: '', interrupted: false } }))
  const r = await $.tool.call({ tool: 'Bash', command: 'cd canal/yt && python buffer_post.py run --schedule' })
  expect(r.deny).toContain('bloqueada')
})
