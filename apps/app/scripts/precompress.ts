// This is a Brotli compression script.
// Further compresses the web bundle by another ~20%,
// on top of the hono/compress() implementation in serve.ts.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, constants } from 'node:zlib'

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const COMPRESSIBLE = /\.(js|css|html|json|svg|txt|map)$/

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      yield* walk(path)
    } else {
      yield path
    }
  }
}

for (const file of walk(DIST)) {
  if (!COMPRESSIBLE.test(file) || file.endsWith('.br')) {
    continue
  }

  const source = readFileSync(file)
  // Quality 11 takes seconds per megabyte, which is why this runs at build
  // time rather than per request.
  const compressed = brotliCompressSync(source, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: 11,
      [constants.BROTLI_PARAM_SIZE_HINT]: source.length,
    },
  })

  if (compressed.length >= source.length) {
    continue
  }

  writeFileSync(`${file}.br`, compressed)
  const saved = Math.round((1 - compressed.length / source.length) * 100)
  process.stdout.write(
    `${file.slice(DIST.length + 1)}: ${Math.round(source.length / 1024)} KB -> ${Math.round(
      compressed.length / 1024,
    )} KB (-${saved}%)\n`,
  )
}
