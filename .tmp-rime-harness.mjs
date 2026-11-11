import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DATA_DIR = 'C:/www/zh-keyboard/packages/pinyin/data'
const SRC = path.join(DATA_DIR, 'source')
const PORT = 8731

const server = http.createServer((req, res) => {
  const p = path.join(DATA_DIR, decodeURIComponent(req.url.split('?')[0]))
  if (fs.existsSync(p) && fs.statSync(p).isFile()) {
    res.writeHead(200, { 'Access-Control-Allow-Origin': '*' })
    fs.createReadStream(p).pipe(res)
  } else {
    res.writeHead(404); res.end('not found')
  }
})

function readSrc(name) { return fs.readFileSync(path.join(SRC, name)) }

const createRimeModule = (await import(pathToFileURL(path.join(DATA_DIR, 'rime-api.js')).href)).default

await new Promise((r) => server.listen(PORT, r))
const base = `http://localhost:${PORT}`

const Module = await createRimeModule({
  locateFile: (f) => `${base}/${f}`,
  print: (s) => console.log('RIME>', s),
  printErr: (s) => console.error('RIME!>', s),
})

const F = Module.FS
for (const d of ['/rime', '/rime/build', '/rime_user']) { try { F.mkdir(d) } catch (e) {} }

const files = ['default.yaml', 'pinyin_simp.schema.yaml', 'pinyin_simp.dict.yaml', 'pinyin_simp.anesthesia.dict.yaml']
for (const f of files) F.writeFile('/rime/' + f, readSrc(f))

const rcPre = Module.ccall('rime_wasm_precompile', 'number', [], [])
console.log('PRECOMPILE rc =', rcPre)
const rcInit = Module.ccall('rime_wasm_init', 'number', [], [])
console.log('INIT rc =', rcInit)

for (const k of ['nihao', 'zhongguo', 'a', 'ni']) {
  try {
    const json = Module.ccall('rime_wasm_process_input', 'string', ['string'], [k])
    const st = JSON.parse(json)
    console.log('INPUT', k, '=> candidates:', (st.candidates || []).map(c => c.text))
  } catch (e) {
    console.log('INPUT', k, 'ERROR', e.message)
  }
}
server.close()
