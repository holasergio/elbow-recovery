#!/usr/bin/env node

/**
 * Prebuild script: stamps public/sw.js with a unique build version.
 * This ensures the browser detects a new service worker on every deployment.
 *
 * Usage: node scripts/stamp-sw.mjs
 * Called automatically via "prebuild" npm script.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const swPath = resolve(__dirname, '../public/sw.js')

const version = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)

let content = readFileSync(swPath, 'utf-8')
content = content.replace(
  /const APP_VERSION = '[^']*'/,
  `const APP_VERSION = '${version}'`
)

writeFileSync(swPath, content, 'utf-8')
console.log(`✅ sw.js stamped with version: ${version}`)
