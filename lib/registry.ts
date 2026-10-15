import type { ToolCategory } from './types'

export interface ToolMeta {
  slug: string
  name: string
  description: string
  category: ToolCategory
  /** lucide icon name, resolved via lib/tool-icons */
  icon: string
}

export const TOOL_CATEGORY_LABEL: Record<ToolCategory, string> = {
  devops: '开发运维',
  text: '文本处理',
  education: '教育学术',
  image: '图片处理',
  chart: '数据图表',
  random: '选择随机',
  misc: '其他工具',
  ai: 'AI 工具',
  game: '趣味互动',
}

export const TOOL_CATEGORY_ORDER: ToolCategory[] = [
  'devops',
  'text',
  'education',
  'image',
  'chart',
  'random',
  'misc',
  'ai',
  'game',
]

/**
 * Canonical tool registry. Order here defines the default order;
 * admins may reorder / disable entries from the panel.
 */
export const TOOL_REGISTRY: ToolMeta[] = [
  /* ------------------------------ 开发运维 ------------------------------ */
  { slug: 'base64', name: 'Base64 编码/解码', description: '文本与 Base64 双向实时转换，支持中文', category: 'devops', icon: 'Binary' },
  { slug: 'url-encode', name: 'URL 编码/解码', description: 'UrlEncode 编码与 UrlDecode 解码', category: 'devops', icon: 'Link2' },
  { slug: 'json-format', name: 'JSON 在线转换', description: '实时编辑预览、语法高亮、校验、格式化、转义与压缩', category: 'devops', icon: 'Braces' },
  { slug: 'json-yaml', name: 'JSON / YAML 互转', description: 'JSON 与 YAML 相互转换、格式化与对比', category: 'devops', icon: 'FileCode2' },
  { slug: 'csv-json', name: 'CSV / TSV ↔ JSON', description: 'CSV、TSV 与 JSON 互转，支持列头推断与分隔符选择', category: 'devops', icon: 'Table2' },
  { slug: 'timestamp', name: '时间戳转换', description: 'Unix 时间戳与日期互转，可获取当前时间戳', category: 'devops', icon: 'Clock' },
  { slug: 'hash', name: 'MD5 / SHA 加密', description: 'MD5（32/16 位）、SHA-1、SHA-256 摘要', category: 'devops', icon: 'Fingerprint' },
  { slug: 'hmac', name: '哈希校验 / HMAC', description: 'SHA-1/256/512 与 HMAC-SHA256，支持自定义密钥', category: 'devops', icon: 'ShieldCheck' },
  { slug: 'jwt', name: 'JWT 解析', description: '解析并解码 JSON Web Token 的头部与载荷', category: 'devops', icon: 'KeyRound' },
  { slug: 'base-convert', name: '常用进制转换', description: '2 到 64 进制之间任意转换，BigInt 精确计算', category: 'devops', icon: 'ArrowLeftRight' },
  { slug: 'uuid', name: 'UUID 生成器', description: '批量生成 UUID v4', category: 'devops', icon: 'Shuffle' },
  { slug: 'password', name: '随机密码生成', description: '密码与随机字符串生成，支持批量', category: 'devops', icon: 'KeyRound' },
  { slug: 'naming-convert', name: '命名风格转换', description: 'snake_case、camelCase、PascalCase、kebab-case 互转，支持逐行', category: 'devops', icon: 'CaseSensitive' },
  { slug: 'unicode', name: 'Unicode 转中文', description: 'Unicode 与中文的相互转换', category: 'devops', icon: 'Languages' },
  { slug: 'file-size', name: '文件大小转换', description: '字节、KB、MB、GB、TB 等单位互转', category: 'devops', icon: 'HardDrive' },
  { slug: 'cron', name: 'Cron 表达式生成器', description: '生成与解析 Cron 表达式，预览最近执行时间', category: 'devops', icon: 'Timer' },
  { slug: 'html-escape', name: 'HTML 实体转义', description: 'HTML 与实体字符双向转义', category: 'devops', icon: 'Code' },
  { slug: 'url-params', name: 'URL 参数解析/构造', description: '一键解析 ?a=1&b=2，支持编辑后重新拼接', category: 'devops', icon: 'Link' },
  { slug: 'cookie', name: 'Cookie 解析/构造', description: 'Cookie 字符串解析与构造，含 Domain、Path、Expires 等属性', category: 'devops', icon: 'Cookie' },
  { slug: 'xml-format', name: 'XML 格式化', description: 'XML 在线格式化与压缩，保留注释与 CDATA', category: 'devops', icon: 'FileCode' },
  { slug: 'sql-format', name: 'SQL 格式化', description: 'SQL 美化与压缩，支持关键字大小写与缩进设置', category: 'devops', icon: 'Database' },
  { slug: 'css-gradient', name: 'CSS 渐变生成器', description: '可视化调节线性/径向/锥形渐变，实时预览并生成代码', category: 'devops', icon: 'Palette' },
  { slug: 'mysql-go-struct', name: 'MySQL 转 Go 结构体', description: '数据表字段转 Go 结构体，含类型映射与标签生成', category: 'devops', icon: 'FileCode2' },
  { slug: 'mock-data', name: 'Mock 数据生成器', description: '可视化定义字段 Schema，一键生成测试假数据', category: 'devops', icon: 'Boxes' },
  { slug: 'http-request', name: '在线请求调试', description: '简化版 Postman：构造 HTTP 请求并查看响应', category: 'devops', icon: 'Send' },
  { slug: 'short-link', name: '短链接生成器', description: '长链接转短链接，支持自定义后缀', category: 'devops', icon: 'Link2' },
  { slug: 'http-status', name: 'HTTP 状态码', description: 'HTTP 状态对应的名称与含义速查', category: 'devops', icon: 'BookOpen' },
  { slug: 'user-agent', name: 'User-Agent 解析', description: '解析 UA 的浏览器、系统与设备信息', category: 'devops', icon: 'MonitorSmartphone' },
  { slug: 'ip-lookup', name: 'IP 归属地查询', description: '查询 IP 的地理位置与运营商', category: 'devops', icon: 'Globe' },
  { slug: 'dns-lookup', name: 'DNS 记录查询', description: '通过 DoH 查询 A / MX / TXT 等记录', category: 'devops', icon: 'Server' },
  { slug: 'qrcode', name: '二维码生成', description: '在线生成二维码，支持导出 PNG', category: 'devops', icon: 'QrCode' },

  /* ------------------------------ 文本处理 ------------------------------ */
  { slug: 'markdown', name: 'Markdown 编辑器', description: '在线编辑 Markdown，实时预览', category: 'text', icon: 'FileText' },
  { slug: 'word-count', name: '字数统计', description: '统计字数、段落与标点数量', category: 'text', icon: 'Type' },
  { slug: 'word-freq', name: '词频统计分析', description: '中英文混合分词，统计词频并可视化，支持导出 CSV', category: 'text', icon: 'BarChart3' },
  { slug: 'text-dedupe', name: '文本去重', description: '删除文本中的重复行', category: 'text', icon: 'Filter' },
  { slug: 'text-sort', name: '文本排序', description: '按拼音、数字、长度排序，支持去重、倒序与随机打乱', category: 'text', icon: 'ArrowDownUp' },
  { slug: 'trim-space', name: '字符串去空格', description: '去除所有空格、首尾空格、多余空格与空行', category: 'text', icon: 'Scissors' },
  { slug: 'text-diff', name: '文本对比', description: '按行比对两段文本并输出差异', category: 'text', icon: 'Diff' },
  { slug: 'text-encrypt', name: '文本加密/解密', description: 'AES-GCM 加密解密，密码派生密钥与 Base64 输出', category: 'text', icon: 'Lock' },
  { slug: 'regex-tester', name: '正则测试工具', description: '正则表达式测试，实时高亮匹配与捕获组', category: 'text', icon: 'Regex' },
  { slug: 'rich-text', name: '在线文本编辑 / HTML 获取', description: '富文本编辑，实时获取 HTML', category: 'text', icon: 'PenLine' },
  { slug: 'lorem', name: '假文生成器', description: '生成中文假文或 Lorem Ipsum 占位文本', category: 'text', icon: 'AlignLeft' },

  /* ------------------------------ 教育学术 ------------------------------ */
  { slug: 'unit-convert', name: '单位换算', description: '长度、面积、重量、时间、温度、压力、热量、功率等换算', category: 'education', icon: 'Ruler' },
  { slug: 'calculator', name: '在线计算器', description: '科学计算与 2/8/10/16 进制互转，纯前端运算', category: 'education', icon: 'Calculator' },
  { slug: 'morse', name: '摩斯电码', description: '支持中文的摩斯电码编码与解码', category: 'education', icon: 'Radio' },
  { slug: 'ascii-table', name: 'ASCII 码表', description: '控制字符、标准与非标准 ASCII 对照表', category: 'education', icon: 'Keyboard' },
  { slug: 'date-calc', name: '日期计算器', description: '计算日期差与推算，支持工作日统计', category: 'education', icon: 'CalendarDays' },
  { slug: 'age-calc', name: '年龄计算器', description: '精确计算周岁、虚岁、生肖星座与已活天数', category: 'education', icon: 'Cake' },
  { slug: 'bmi', name: 'BMI 计算器', description: '按中国成人标准评估体重并给出健康范围', category: 'education', icon: 'Activity' },
  { slug: 'loan', name: '房贷计算器', description: '等额本息/本金月供计算与逐年还款明细', category: 'education', icon: 'Home' },
  { slug: 'tax', name: '个税计算器', description: '按累计预扣预缴法计算每月个税与税后收入', category: 'education', icon: 'Receipt' },
  { slug: 'pomodoro', name: '番茄工作法', description: '工作/休息周期计时，自动循环切换', category: 'education', icon: 'Timer' },
  { slug: 'countdown', name: '倒计时计时器', description: '自定义倒计时，支持开始、暂停与重置', category: 'education', icon: 'Hourglass' },

  /* ------------------------------ 图片处理 ------------------------------ */
  { slug: 'image-base64', name: '图片 / Base64 互转', description: '图片与 Base64 双向转换，纯前端处理', category: 'image', icon: 'FileImage' },
  { slug: 'image-compress', name: '图片压缩', description: '调节质量与尺寸压缩图片，纯前端处理', category: 'image', icon: 'Minimize2' },
  { slug: 'image-convert', name: 'PNG / JPG 格式互转', description: 'PNG 与 JPG 互转，支持质量调节与实时预览', category: 'image', icon: 'ImageIcon' },
  { slug: 'image-split', name: '图片分割', description: '将图片分割为宫格，支持自定义行列', category: 'image', icon: 'LayoutGrid' },
  { slug: 'image-watermark', name: '图片水印', description: '添加文字或图片水印，可调位置与透明度', category: 'image', icon: 'Droplet' },
  { slug: 'image-palette', name: '图片取色板', description: '中位切分算法提取主色调，点击色块复制 HEX', category: 'image', icon: 'Palette' },
  { slug: 'text-to-image', name: '文本转图片', description: '把文本转换为长图，支持多种排版', category: 'image', icon: 'ImageIcon' },
  { slug: 'favicon', name: 'Favicon 生成器', description: '上传图片生成 16~512px 多尺寸网站图标', category: 'image', icon: 'Sparkles' },
  { slug: 'doodle', name: '在线涂鸦画板', description: '画笔/橡皮、撤销重做、一键下载 PNG', category: 'image', icon: 'Brush' },

  /* ------------------------------ 数据图表 ------------------------------ */
  { slug: 'chart-bar', name: '柱状图', description: '像做表格一样制作柱状图，支持导出 SVG', category: 'chart', icon: 'BarChart' },
  { slug: 'chart-line', name: '折线图', description: '像做表格一样制作折线图，支持导出 SVG', category: 'chart', icon: 'LineChart' },
  { slug: 'chart-pie', name: '饼图', description: '像做表格一样制作饼图，支持导出 SVG', category: 'chart', icon: 'PieChart' },
  { slug: 'chart-scatter', name: '散点图', description: '像做表格一样制作散点图，支持导出 SVG', category: 'chart', icon: 'ScatterChart' },

  /* ------------------------------ 选择随机 ------------------------------ */
  { slug: 'random-number', name: '生成随机数', description: '可定制范围内生成随机数字，支持去重', category: 'random', icon: 'Dices' },
  { slug: 'decide', name: '帮我决定', description: '选择困难时自定义选项，交由工具决定', category: 'random', icon: 'CircleDot' },
  { slug: 'coin', name: '抛硬币', description: '在线抛硬币，交给硬币帮你选择', category: 'random', icon: 'Coins' },
  { slug: 'dice', name: '投骰子', description: '自定义骰子数量在线投掷', category: 'random', icon: 'Dices' },
  { slug: 'random-name', name: '随机中文人名生成', description: '支持单姓/复姓、性别筛选与批量生成', category: 'random', icon: 'UserRound' },
  { slug: 'wheel', name: '抽奖转盘', description: '输入选项生成转盘，支持结果记录与中奖移除', category: 'random', icon: 'Target' },
  { slug: 'roll-call', name: '随机点名器', description: '导入名单滚动点名，不重复抽取并记录结果', category: 'random', icon: 'Users' },

  /* ------------------------------ 其他工具 ------------------------------ */
  { slug: 'number-to-cn', name: '数字转金额大写', description: '数字一键转换成人民币大写', category: 'misc', icon: 'Coins' },
  { slug: 'color-picker', name: '颜色选择器', description: 'HEX、RGB、HSL、HSB 等色彩空间互转', category: 'misc', icon: 'Pipette' },
  { slug: 'danmaku', name: '手持弹幕', description: '全屏滚动弹幕，可调速度与字号', category: 'misc', icon: 'MonitorPlay' },
]

export const TOOL_MAP = new Map(TOOL_REGISTRY.map((t) => [t.slug, t]))

/** Tools that may reach an external endpoint configured in the admin panel. */
export const NETWORK_TOOLS = new Set(['ip-lookup', 'dns-lookup'])
