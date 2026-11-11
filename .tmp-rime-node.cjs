const path = require('path')
const fs = require('fs')

const DATA_DIR = 'C:/www/zh-keyboard/packages/pinyin/data'
const SRC = path.join(DATA_DIR, 'source')

const createRimeModule = require(path.join(DATA_DIR, 'rime-api.js'))

const logs = []
createRimeModule({
  locateFile: (f) => path.join(DATA_DIR, f),
  print: (s) => { logs.push('[out] ' + s); console.log('RIME>', s) },
  printErr: (s) => { logs.push('[err] ' + s); console.error('RIME!>', s) },
}).then((Module) => {
  const F = Module.FS
  for (const d of ['/rime', '/rime/build', '/rime_user']) {
    try { F.mkdir(d) } catch (e) {}
  }
  const files = ['default.yaml', 'pinyin_simp.schema.yaml', 'pinyin_simp.dict.yaml', 'pinyin_simp.anesthesia.dict.yaml']
  for (const f of files) {
    F.writeFile('/rime/' + f, fs.readFileSync(path.join(SRC, f)))
  }
  const rcPre = Module.ccall('rime_wasm_precompile', 'number', [], [])
  console.log('PRECOMPILE rc =', rcPre)
  const rcInit = Module.ccall('rime_wasm_init', 'number', [], [])
  console.log('INIT rc =', rcInit)
  // try a couple of inputs
  for (const k of ['nihao', 'zhongguo', 'a']) {
    try {
      const json = Module.ccall('rime_wasm_process_input', 'string', ['string'], [k])
      console.log('INPUT', k, '=>', json)
    } catch (e) {
      console.log('INPUT', k, 'ERROR', e.message)
    }
  }
}).catch((e) => {
  console.error('MODULE LOAD ERROR', e)
})
