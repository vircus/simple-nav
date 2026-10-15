#!/usr/bin/env node
/**
 * 生成管理员密码哈希，写入 ADMIN_PASSWORD_HASH 环境变量。
 *
 * 用法：
 *   node scripts/hash.mjs <密码> <SESSION_SECRET 的值>
 *
 * 说明：哈希算法为 sha256(`<密码>:<SESSION_SECRET>`)，与 lib/auth.ts 保持一致。
 * 因此修改 SESSION_SECRET 后必须重新生成哈希。
 */
import { createHash } from 'node:crypto'

const password = process.argv[2]
const secret = process.argv[3] || process.env.SESSION_SECRET

if (!password) {
  console.error('用法：node scripts/hash.mjs <密码> <SESSION_SECRET 的值>')
  process.exit(1)
}
if (!secret) {
  console.error('缺少 SESSION_SECRET：请作为第二个参数传入，或先设置该环境变量。')
  process.exit(1)
}

const hash = createHash('sha256').update(`${password}:${secret}`).digest('hex')
console.log('\n把下面这行写入环境变量 ADMIN_PASSWORD_HASH：\n')
console.log(hash)
console.log()
