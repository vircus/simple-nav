# 主页工具导航站

基于 **Next.js 15（App Router）+ TypeScript + Tailwind CSS** 的主页工具导航站，部署于 **腾讯云 EdgeOne Pages**。
桌面端为左侧边栏，移动端自动切换为底部导航；内置 **70+ 工具**，覆盖 9 大分类；管理面板位于 `/admin`。

对应 PRD：[`docs/PRD.md`](./docs/PRD.md)

---

## 快速开始

```bash
npm install
cp .env.example .env.local        # 填入下面几个变量
npm run dev                        # http://localhost:3000
```

### 环境变量

| 变量 | 必需 | 说明 |
| --- | --- | --- |
| `ADMIN_USERNAME` | ✅ | 管理员账号（默认 `admin`） |
| `ADMIN_PASSWORD` | ✅* | 明文密码 |
| `ADMIN_PASSWORD_HASH` | 否* | 密码哈希，**配置后优先于明文**（生产推荐） |
| `SESSION_SECRET` | ✅ | 会话签名密钥（≥32 位随机串） |
| `SITE_DOMAIN` | ➖ | 主域名初始默认值；正式配置在管理面板维护 |

\* 二者至少配置其一；同时配置时以 `ADMIN_PASSWORD_HASH` 为准。

```bash
# 1) 生成会话密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2) 生成密码哈希（第二个参数必须与 SESSION_SECRET 完全一致）
node scripts/hash.mjs <你的密码> <SESSION_SECRET 的值>
```

> 哈希算法为 `sha256("<密码>:<SESSION_SECRET>")`，因此**修改 `SESSION_SECRET` 后必须重新生成哈希**。

---

## 管理面板

访问 `/admin` 登录（账号 + 密码）。

| 规则 | 行为 |
| --- | --- |
| 未登录访问 `/admin/*` | 重定向至 `/admin/login` |
| 无会话访问 `/api/admin/*` | 返回 401 |
| `robots.txt` | `Disallow: /admin`、`/api/` |

**安全边界**：路径是公开可发现的，因此防线全部落在凭据与会话上——密码哈希、HMAC 签名 `httpOnly` Cookie、登录限流（同 IP 连续失败 5 次锁定 15 分钟）。生产环境务必使用强密码并配置 `ADMIN_PASSWORD_HASH`。

### 登录不上的排查步骤

先跑诊断脚本：

```bash
npm run env:check
```

它会检查 `.env*` 文件是否存在、四个变量是否设置、并指出常见错误（不打印任何敏感值）。

最常见的原因，按出现频率排序：

| 原因 | 表现 | 处理 |
| --- | --- | --- |
| **只改了 `.env.example`** | 任何账号密码都失败 | `.env.example` 是模板，**不会被加载**。要复制成 `.env.local` |
| **改完没重启服务** | 变量没生效 | Next.js 只在启动时读取 `.env*`，改完必须重启 `npm run dev` |
| **同时设了明文与哈希** | 明文密码失效 | `ADMIN_PASSWORD_HASH` 优先；哈希必须由**当前** `SESSION_SECRET` 生成 |
| **改过 `SESSION_SECRET`** | 哈希校验失败 | 哈希算法为 `sha256(密码:SESSION_SECRET)`，换密钥后需重新生成哈希 |
| **连续失败 5 次** | 提示"尝试次数过多" | 同 IP 锁定 15 分钟，等待或重启服务清空计数 |

服务端未配置任何凭据时，登录接口返回 **500** 并明确提示（而不是含糊的"账号或密码不正确"），登录页顶部也会显示警告横幅。

---

## 配色

**绿白灰**：绿色为唯一强调色相，白色与灰色承担底与层次。

| 令牌 | 色值 | 用途 |
| --- | --- | --- |
| brand | `#15803D` | 主绿：文字强调、图标、主 CTA |
| accent | `#059669` | 翠绿：渐变终点、次要强调 |
| solar | `#79B291` | 灰绿：浅色徽标与描边 |
| pop | `#107A57` | 墨绿：成功态、进度 |
| flash | `#64746E` | 中性灰：辅助信息、表格 |
| coral | `#B91C1C` | **语义错误色**，不参与装饰轮转 |

强调色轮转已排除 `coral`，因此分类标识始终停留在绿色梯度内。大胆排版与微交互（悬停抬升、聚光灯、磁吸、滚动揭示等）保留，动效强度相应收敛。

---

## 内置工具（70+）

| 分类 | 数量 | 代表工具 |
| --- | --- | --- |
| 开发运维 | 31 | Base64、URL 编解码、JSON/YAML、CSV↔JSON、时间戳、MD5/SHA/HMAC、JWT、进制转换、UUID、密码、命名风格、Unicode、文件大小、Cron、HTML 转义、URL 参数、Cookie、XML、SQL、CSS 渐变、MySQL→Go、Mock 数据、HTTP 调试、短链接、HTTP 状态码、UA 解析、IP/DNS 查询、二维码 |
| 文本处理 | 11 | Markdown、字数统计、词频、去重、排序、去空格、对比、AES 加密、正则测试、富文本、假文生成 |
| 教育学术 | 11 | 单位换算、科学计算器、摩斯电码、ASCII 码表、日期/年龄/BMI/房贷/个税计算器、番茄钟、倒计时 |
| 图片处理 | 9 | 图片↔Base64、压缩、PNG/JPG 互转、分割、水印、取色板、文本转图片、Favicon、涂鸦画板 |
| 数据图表 | 4 | 柱状图、折线图、饼图、散点图（手工 SVG，无图表库依赖） |
| 选择随机 | 7 | 随机数、帮我决定、抛硬币、投骰子、随机人名、抽奖转盘、随机点名 |
| 其他工具 | 3 | 数字转金额大写、颜色选择器、手持弹幕 |

除 IP/DNS 查询、HTTP 调试、短链接外，**全部在浏览器本地计算**，输入内容不上传。

#### 首页主文案（一言）

首页大标题不再是固定文案，而来自一言接口。

| 项 | 说明 |
| --- | --- |
| 主源 | `GET https://uapis.cn/api/v1/saying`（免费，无需密钥） |
| 备用源 | `GET https://v1.hitokoto.cn/`（独立第三方） |
| 代理 | `GET /api/saying` —— 串行尝试两个源，任一成功即返回，全失败返回 502 |

管理面板「站点设置 → 一言」可配置：

| 字段 | 说明 |
| --- | --- |
| 优先使用 | UAPI 或 Hitokoto；另一个自动作为备用 |
| UAPI API Key | 可留空；填写后以 `Authorization: Bearer <key>` 携带 |

接口失败或加载中时回退到固定文案（`站点 · 工具 / 一处直达`），**首屏不会空白**。

## 热点板块（首页）

首页搜索框上方为「热点板块」，聚合自 [uapis.cn](https://uapis.cn) 全网热榜。

| 项 | 说明 |
| --- | --- |
| 平台 | 微博热搜 `weibo`、知乎日报 `zhihu-daily`、今日头条 `toutiao`、抖音 `douyin` |
| 时光机 | 实时（不传 `time`）/ 昨天 / 前天 / 指定日期，默认实时 |
| 代理 | `GET /api/hotboard?type=&time=` |

**为什么必须走服务端代理**：uapis.cn 不返回 CORS 头，浏览器直连会被拦截，因此统一由本站转发并做内存缓存（热榜 120s）。

时光机传的是**毫秒时间戳**，取目标日期当天 12:00（本地时区）。返回的 `update_time` 为 UTC，界面按北京时间展示。

**PC 端布局**：Hero 与热点板块左右分栏（`lg:grid-cols-[minmax(0,1fr)_330px]`），热点板块居右且启用紧凑模式
（限 12 条、隐藏热度行与外链图标、列表区 `max-h-[300px]`、`lg:sticky` 吸顶）。移动端仍为单列堆叠。

## UAPI 实验室（/uapi）

独立页面，聚合 uapis.cn 的其他热门接口：

| 接口 | 上游路径 | 缓存 |
| --- | --- | --- |
| 一言 | `/api/v1/saying` | 30s |
| 天气查询（可输入城市） | `/api/v1/misc/weather` | 600s |
| 我的 IP | `/api/v1/network/myip` | 60s |
| 程序员历史上的今天 | `/api/v1/history/programmer/today` | 3600s |
| 每日单词 | `/api/v1/daily/word` | 3600s |
| 答案之书 | `/api/v1/answerbook/ask` | 15s |

统一经 `GET /api/uapi?kind=<类型>&<参数>` 代理。新增接口只需在 `lib/uapi.ts` 的 `UAPI_ENDPOINTS` 里加一条，
并写对应卡片组件。

**默认懒加载**：进入页面时**不发起任何请求**，各卡片处于「空闲态」并显示点击提示；
只有用户点击卡片（或右上角的运行按钮）后才会真正调用接口。
实现要点：`useUapi` 内部**没有 `useEffect`**，请求只能通过 `run()` 显式触发。
天气卡片需先输入城市再点「查询」。

入口：桌面侧边栏「UAPI 实验室」、移动端底部导航「热榜」。

## 自定义工具

管理面板 →「自定义」可自行新增工具，无需改代码。两种类型：

| 类型 | 说明 |
| --- | --- |
| **外链** | 跳转到已有的外部工具站，适合把常用但不想自己实现的工具收进来 |
| **嵌入** | 粘贴一段 HTML/CSS/JS，在**沙箱 iframe** 中运行 |

安全约束：

- 嵌入内容使用 `sandbox="allow-scripts allow-modals allow-forms allow-popups"`，**不带 `allow-same-origin`** —— 因此注入的脚本无法访问本站 DOM、`localStorage` 或会话 Cookie。
- slug 必须匹配 `^[a-z0-9][a-z0-9-]{0,39}$`，且**不能与内置工具冲突**，服务端会二次校验。
- 嵌入 HTML 上限 200,000 字符。

自定义工具会与内置工具一同出现在工具箱列表与对应分类锚点中。

## 侧边栏分类联动

侧边栏的分类区随当前页面切换：

| 当前页面 | 侧边栏分类区 |
| --- | --- |
| `/`（首页） | 站点分类，锚点 `#cat-<id>` 滚动到对应分组 |
| `/tools`、`/tools/<slug>` | 工具分类，链接 `/tools#tool-cat-<category>` |

工具分类同时统计内置与自定义工具，空分类不展示。

## 服务端 API

| 接口 | 用途 |
| --- | --- |
| `POST /api/tools/http` | HTTP 请求调试代理：绕过浏览器跨域限制读取响应；**拒绝内网与本机地址**，防 SSRF |
| `POST /api/tools/shorten` | 生成短链接，存入 KV |
| `PUT /api/admin/tools-custom` | 保存自定义工具（校验 slug 合法性与与内置工具冲突） |
| `GET /s/<code>` | 短链接跳转 |
| `GET /api/tools/proxy` | 网络查询工具代理：仅在后台配置了鉴权 Token 时启用，Token 不下发浏览器 |

---

## 部署到 EdgeOne Pages

1. 推送代码到 GitHub / GitLab。
2. EdgeOne 控制台 → Pages → 创建项目并关联仓库。
3. 构建设置：Framework `Next.js`，构建命令 `npm run build`，输出目录 `.next`。
4. 项目设置 → 环境变量：填入上表必填项。
5. 控制台创建 KV 命名空间（如 `nav-store`），在项目「KV 存储」中绑定，**变量名必须为 `NAV_KV`**。
6. 触发构建 → 绑定自定义域名（TXT 验证 → CNAME → 自动签发 SSL）。
7. 首次登录后，在「站点设置 → 主域名」填写主域名。

### 部署前必读

| 约束 | 处理 |
| --- | --- |
| Next.js 原生 `rewrites` / `redirects` 不受支持 | 路由改由 `middleware.ts` 处理 |
| 根目录 `.nvmrc` 会导致构建失败 | 未纳入仓库 |
| 无持久化文件系统 | 所有状态写入 KV，代码内无文件写入 |
| KV 为最终一致性（≤60s） | 保存后前端乐观更新，不回读校验 |
| 加速区域选「不含中国大陆」时国内返回 401 | 国内访问需切换加速区域并完成 ICP 备案 |
| 构建期网络受限 | **未使用** `next/font/google`，字体走纯 CSS 栈 |

---

## 目录结构

```
app/
├── layout.tsx              根布局（主题脚本、光标光晕、SEO 元数据）
├── (site)/                 前台：首页、工具列表、工具详情
├── admin/                  管理面板（/admin）
├── s/[code]/               短链接跳转
└── api/                    site-data / admin/* / tools/{http,shorten,proxy}
components/
├── fx/                     光标光晕、滚动揭示、指针特效
├── layout/                 侧边栏、底部导航、响应式外壳
├── tools/                  按分类分组的工具实现
├── admin/                  管理面板视图与数据钩子
└── ui/                     Button / Toast / Skeleton
lib/
├── kv.ts                   KV 封装（含本地内存回退）
├── auth.ts                 凭据校验、签名会话、登录限流
├── data.ts                 公开负载脱敏、工具列表调和
├── links.ts                短链接读写
├── tools/                  工具纯函数（codec / devops / edu / calc / text / crypto / network）
└── registry.ts             工具元数据注册表（9 大分类）
middleware.ts               /admin 与 /api/admin 会话校验
```

---

## 已验证项

- `npm run build` 通过；首页 First Load JS 114 kB，工具详情页 166 kB（预算 250 kB）
- `/`、`/tools`、`/tools/[slug]`（jwt / chart-pie / doodle / unit-convert / calculator 等）均返回 200
- `/admin` 未登录 → 307 登录页；密码错与账号错均 401；正确凭据 200
- 带会话访问 `/admin`、`/admin/settings` → 200；`robots.txt` 含 `Disallow: /admin`
- 短链接生成 → `/s/demo` 302 跳转正确
- HTTP 调试代理拒绝 `127.0.0.1`，允许外部地址
