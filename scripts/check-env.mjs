#!/usr/bin/env node
/**
 * 检查管理员登录所需的环境变量是否已正确配置。
 *
 * 用法：npm run env:check
 *
 * 只报告「是否设置」与长度，绝不打印任何敏感值。
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
/** Next.js 会按此顺序加载（后者优先级更高，实际以 Next 规则为准） */
const FILES = [
  '.env.development.local',
  '.env.local',
  '.env.development',
  '.env.production.local',
  '.env.production',
  '.env',
]

function parse(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
  const out = new Map()
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    // dotenv 行为：剥掉成对的引号
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out.set(key, value)
  }
  return out
}

const present = FILES.filter((f) => fs.existsSync(path.join(ROOT, f)))
const merged = new Map()
// 按 Next 的优先级：先加载的先写入，后加载的覆盖（近似）
for (const f of [...FILES].reverse()) {
  if (!fs.existsSync(path.join(ROOT, f))) continue
  for (const [k, v] of parse(f)) merged.set(k, v)
}
// 进程内真实环境变量优先级最高
for (const k of ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET']) {
  if (process.env[k] !== undefined) merged.set(k, process.env[k])
}

const ok = (b) => (b ? '\x1b[32m✔\x1b[0m' : '\x1b[31m✘\x1b[0m')
const len = (v) => (v ? `${v.length} 字符` : '未设置')

console.log('\n=== 管理员登录环境检查 ===\n')

console.log('环境变量文件：')
if (present.length === 0) {
  console.log('  \x1b[31m未找到任何 .env 文件\x1b[0m')
} else {
  for (const f of present) console.log(`  ${ok(true)} ${f}`)
}
if (fs.existsSync(path.join(ROOT, '.env.example'))) {
  console.log('  提示：.env.example 只是模板，\x1b[33m不会被加载\x1b[0m')
}

const username = merged.get('ADMIN_USERNAME')
const plain = (merged.get('ADMIN_PASSWORD') ?? '').trim()
const hash = (merged.get('ADMIN_PASSWORD_HASH') ?? '').trim()
const secret = (merged.get('SESSION_SECRET') ?? '').trim()

console.log('\n变量状态：')
console.log(`  ${ok(true)}  ADMIN_USERNAME      ${username ? `${username}（已设置）` : '未设置 → 使用默认 admin'}`)
console.log(`  ${ok(Boolean(plain))} ADMIN_PASSWORD       ${len(plain)}`)
console.log(`  ${ok(Boolean(hash))} ADMIN_PASSWORD_HASH  ${len(hash)}`)
console.log(`  ${ok(secret.length >= 32)} SESSION_SECRET      ${len(secret)}`)

console.log('\n判定：')
let fatal = false

if (!plain && !hash) {
  fatal = true
  console.log('  \x1b[31m致命：ADMIN_PASSWORD 与 ADMIN_PASSWORD_HASH 均未设置 —— 任何账号密码都无法登录。\x1b[0m')
}

if (hash && plain) {
  console.log('  \x1b[33m注意：两者同时设置时，优先使用 ADMIN_PASSWORD_HASH。若哈希不是用当前 SESSION_SECRET 生成的，明文密码会失效。\x1b[0m')
}
if (hash && !plain) {
  console.log('  当前走哈希分支：登录密码是生成哈希时用的原文，且哈希必须与当前 SESSION_SECRET 匹配。')
}
if (secret && secret.length < 32) {
  console.log(`  \x1b[33m建议：SESSION_SECRET 仅 ${secret.length} 字符，建议 ≥32。\x1b[0m`)
}
if (!secret) {
  fatal = true
  console.log('  \x1b[31m致命：SESSION_SECRET 未设置 —— 会话签名将退化为内置默认值，存在安全风险。\x1b[0m')
}

console.log('\n修复步骤：')
console.log('  1) 在项目根目录创建 .env.local：')
console.log('       ADMIN_USERNAME=admin')
console.log('       ADMIN_PASSWORD=你的密码')
console.log('       SESSION_SECRET=' + 'x'.repeat(32) + '  # ≥32 位随机串')
console.log('  2) 生成密钥：node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
console.log('  3) \x1b[1m重启开发服务器\x1b[0m（Next.js 只在启动时读取 .env*，改完不重启无效）')
console.log('  4) 重新运行 npm run env:check 确认\n')

process.exit(fatal ? 1 : 0)
