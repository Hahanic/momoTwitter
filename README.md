<div align="center">
	<h1>momoTwitter ✨</h1>
	<p>一个基于 <strong>Vue 3 + TypeScript + Vite</strong> 前端 与 <strong>Node.js (Express) + MongoDB + Socket.IO</strong> 后端的类 Twitter / 社交 & 即时聊天应用。支持 AI 翻译与对话、媒体上传、实时消息与在线状态、游标分页、令牌刷新机制等。</p>
	<p>
		<a href="#快速开始">快速开始</a> ·
		<a href="#功能特性">功能特性</a> ·
		<a href="#技术栈">技术栈</a> ·
		<a href="#目录结构">目录结构</a> ·
		<a href="#环境变量">环境变量</a> ·
		<a href="#运行与开发脚本">运行脚本</a> ·
		<a href="#接口概览">接口概览</a> ·
		<a href="#socket-事件">Socket 事件</a> ·
		<a href="#工程规范">工程规范</a> ·
		<a href="#待办与改进">改进建议</a>
	</p>
</div>

---

## 目标概述

本项目演示一个中型社交应用的核心能力：
- 账号注册 / 登录 / 刷新令牌 / 关注与取关
- 发帖、回复、引用、转推、点赞、收藏、浏览数统计与翻译
- 用户主页多分类（Posts / Replies / Likes / Bookmarks）
- 私信与群聊（实时在线状态、未读数、消息增量加载）
- AI 能力：基于七牛云 OpenAI 接口（deepseek-v3）实现帖子翻译与聊天流式输出
- 媒体上传：接入 Cloudflare R2（S3 兼容）并返回公共访问 URL
- 前端 Token 过期自动刷新队列化处理，避免并发重复刷新

## 功能特性

### 社交互动
- 发帖类型：普通、回复、引用；引用与回复自动维护对应统计字段
- 交互状态：点赞 / 收藏 / 转推（幂等切换，计数增减）
- 浏览数：轻量打点接口（`POST /posts/:id/views`）
- 用户统计：关注数 / 粉丝数 / 帖子数 / 转推数等聚合更新
- 游标分页：时间线 / 回复 / 用户主页分类统一使用 ISO 时间游标

### 用户 & 鉴权
- JWT 双令牌：短期 `AccessToken`（Authorization: Bearer）、长期 `RefreshToken`（HttpOnly Cookie）
- 刷新机制：后端校验会话（`Session` 模型），前端失败队列等待刷新完成后重播请求
- 限制注册（可配置管理口令 `REGISTER_PASSWORD`）
- 会话追踪：记录设备与 UA 信息（IP、浏览器、OS、设备类型）

### 即时通讯 & 实时能力
- Socket.IO 多设备在线管理（同一用户多个 socket 合并）
- 在线状态广播（presence:init / presence）与私聊房间自动加入
- 新消息推送、未读消息数聚合、会话元信息更新（最后消息时间/摘要）
- 新私聊创建时双方实时加入房间 & 初始化未读数

### AI & 增强体验
- 帖子翻译：保留表情、@用户名、#话题、URL，不做不适当改写
- AI 对话：流式返回（后端使用 responseType: 'stream'）

### 媒体与存储
- Cloudflare R2 上传：单图 / 多图（最多 4 张）并生成随机安全文件名
- 返回公共 URL 用于后续发帖引用

### 前端体验
- Vue 3 `<script setup>` + TypeScript 强类型
- Pinia + 持久化插件管理用户与聊天状态
- 国际化：`vue-i18n` + 多语言包（`en/ja/zh-CN.json`）
- 组件拆分：通用 UI、布局、帖子、聊天、Modal、Skeleton、状态页
- Emoji Picker、图片预览、无限滚动、媒体选择、消息管理等组合式函数
- Axios 实例：请求/响应拦截、错误友好提示、并发刷新队列
- 构建优化：Gzip + Brotli 压缩、Bundle 可视化 (`rollup-plugin-visualizer`)、TailwindCSS v4(Vite 插件)

### 工程化
- Monorepo：NPM workspaces (`frontend` / `backend`)
- 统一格式化：Prettier（含 `prettier-plugin-tailwindcss` 排序）、ESLint 分离 JS/Vue 规则 & import 顺序
- Commit 规范：`commitizen` + `cz-git` + `commitlint` 中文交互 & emoji
- 质量脚本：`npm run check`（格式化 + lint），`lint-staged` 提交前增量处理

## 技术栈

| 层面 | 技术 |
|------|------|
| 前端框架 | Vue 3, TypeScript, Vite |
| 状态管理 | Pinia + pinia-plugin-persistedstate |
| 路由 / 国际化 | Vue Router, vue-i18n |
| UI & 样式 | TailwindCSS v4, 自定义组件库, emoji-picker-element |
| Markdown & 高亮 | markdown-it, highlight.js |
| 网络 & 实时 | Axios（自动刷新 Token）, Socket.IO Client |
| 后端框架 | Express 5, Socket.IO Server |
| 数据库 | MongoDB + Mongoose 8 |
| 鉴权 | JWT (Access + Refresh), bcrypt |
| 云存储 | Cloudflare R2 (S3Client) |
| AI 服务 | 七牛云 OpenAI 接口 (deepseek-v3) |
| 其他 | ua-parser-js, multer, dotenv |

## 目录结构（简化）

```
momoTwitter/
├─ package.json                # 根：workspaces + 通用脚本
├─ backend/
│  ├─ src/
│  │  ├─ index.js             # 服务器入口、端口、CORS、Socket 初始化
│  │  ├─ routes/*.js          # REST 路由分组 (auth/posts/chat/bot/upload/user)
│  │  ├─ controller/*.js      # 业务控制器（发帖、鉴权、聊天等）
│  │  ├─ services/            # AI、R2、PostService 等服务
│  │  ├─ db/model/*.js        # Mongoose 模型 (User/Post/Like/...)
│  │  ├─ middleware/*.js      # 验证、错误处理、上传、鉴权
│  │  ├─ socket/index.js      # 实时聊天 & presence
│  │  └─ utils/index.js       # JWT、统一响应、游标解析
├─ frontend/
│  ├─ src/
│  │  ├─ api/axiosInstance.ts # Axios 封装 + 刷新队列
│  │  ├─ socket/index.ts      # 客户端 Socket 事件注册
│  │  ├─ stores/              # Pinia store（用户/聊天/帖子缓存等）
│  │  ├─ routers/             # 路由守卫 + 动态模块
│  │  ├─ components/          # UI/布局/帖子/聊天/Modal 等组件
│  │  ├─ composables/         # 业务组合函数
│  │  ├─ types/               # TS 类型声明
│  │  ├─ locales/             # 多语言包
│  │  └─ utils/               # 前端工具函数
```

## 环境变量

后端 `.env` 参考（必填按需调整）：

| 变量 | 说明 |
|------|------|
| DBHOST | Mongo 主机，如 `127.0.0.1` |
| DBPORT | Mongo 端口，如 `27017` |
| DBNAME | 数据库名 |
| MONGO_USER | Mongo 用户（若启用鉴权）|
| PASSWORD | Mongo 用户密码 |
| JWT_SECRET | JWT 签名密钥（必须）|
| REGISTER_PASSWORD | 限制注册的口令（可选）|
| Test_Server | 测试跨域白名单（例如手机局域网访问）|
| QINIU_AI_API_KEY | 七牛云 AI 接口 Key（翻译/聊天）|
| CLOUDFLARE_ACCOUNT_ID | R2 账号 |
| CLOUDFLARE_ACCESS_KEY_ID | R2 Access Key |
| CLOUDFLARE_SECRET_ACCESS_KEY | R2 Secret Key |
| CLOUDFLARE_R2_BUCKET_NAME | R2 Bucket 名称 |
| CLOUDFLARE_R2_PUBLIC_URL | R2 公共文件访问前缀 |
| NODE_ENV | 运行环境 `development/production` |

前端 `.env`：

| 变量 | 说明 |
|------|------|
| VITE_API_BASE_URL | 后端 API 基地址，如 `http://127.0.0.1:3000/api` |
| VITE_BASE_URL | Socket.IO 连接基地址，如 `http://127.0.0.1:3000` |

## 运行与开发脚本

根目录执行：

```powershell
# 安装依赖（自动安装两个 workspace）
npm install

# 开发同时启动前后端
npm run dev

# 仅前端构建
npm run build

# 代码格式 + Lint 综合检查
npm run check

# 单独修复 Lint
npm run lint:fix

# 交互式规范提交
npm run commit
```

前端独立脚本（workspace 内）：
- `npm run dev` -> Vite 开发服务器 (默认 5173)
- `npm run build` -> TS 校验 + 打包 (开启 gzip & brotli)
- `npm run preview` -> 构建结果本地预览

后端独立脚本：
- `npm run dev` -> nodemon 监听 `src/index.js`
- `npm run insert-posts` -> （脚本占位，批量初始化数据）

## 接口概览

> 统一前缀：`/api`；鉴权路由需携带 `Authorization: Bearer <AccessToken>`（除刷新接口）以及 Cookie 中的 `refreshToken`。

### Auth (`/api/auth`)
- `POST /register` 注册（支持限制口令）
- `POST /login` 登录
- `POST /logout` 登出（清除会话 & Cookie）
- `POST /refresh-token` 刷新 AccessToken
- `GET /me` 获取当前登录用户
- `PUT /me` 更新个人资料（自动同步用户历史帖子作者信息）
- `GET /captcha` 获取登录验证码（简单随机字符）
- `POST /:username/follow` 关注用户
- `DELETE /:username/follow` 取消关注

### User (`/api/users`)
- `GET /:username` 用户公开资料（登录时附带是否已关注）
- `GET /:username/following` 关注列表
- `GET /:username/followers` 粉丝列表

### Posts (`/api/posts`)
- `GET /` 公共时间线（标准 & 引用）
- `GET /following` 关注时间线（含自己 + 转推合并排序）
- `POST /` 创建帖子或回复/引用
- `GET /search?q=...` 搜索帖子（分页）
- `GET /:postId` 单条帖子（附带当前用户交互状态）
- `DELETE /:postId` 删除（级联子回复 + 同步统计）
- `GET /:postId/replies` 回复列表（游标分页）
- `GET /:postId/parent` 获取所有祖先父帖（链路）
- `POST /:postId/retweets` 转推 / 取消
- `POST /:postId/likes` 点赞 / 取消
- `POST /:postId/bookmarks` 收藏 / 取消
- `POST /:postId/views` 浏览计数
- `GET /:username/category?category=posts|replies|likes|bookmarks` 用户主页分类
- `POST /:postId/translate` 翻译帖子内容

### Chat (`/api/chat`)
- `GET /` 当前用户全部会话（含未读数、对方信息、置顶/免打扰等）
- `POST /` 创建私聊或群聊（自动双方加入房间，初始化会话）
- `GET /:conversationId/messages` 拉取消息（游标分页）

### Bot / AI (`/api/bot`)
- `GET /chat` 对话列表
- `POST /chat` 新建对话并发起消息
- `POST /chat/:id` 继续对话（上下文）
- `GET /chat/:id` 单个对话历史
- `PUT /chat/:id/rename` 重命名对话
- `DELETE /chat/:id` 删除对话

### Upload (`/api/upload`)
- `POST /image` 单图上传（multipart/form-data，字段 `image`）
- `POST /images` 多图上传（最多 4 张，字段 `images`）

## Socket 事件

| 事件 | 方向 | 说明 |
|------|------|------|
| `presence:init` | S->C | 初次连接后返回当前用户相关在线列表 |
| `presence` | S->C | 某相关用户上下线 `{ userId, status }` |
| `connected` | S->C | 连接成功回执（含自身 userId）|
| `newConversation` | S->C | 收到新私聊会话（对方发起）|
| `newMessage` | S->C | 某会话新消息到达（含消息完整体）|
| `conversationUpdated` | S->C | 会话列表元信息更新（最后消息时间 & 摘要）|
| `markRead` | C->S | 标记会话已读（更新 lastReadAt）|
| `leaveConversation` | C->S | 客户端主动离开房间 |

房间策略：每个会话使用其 `_id` 作为房间名；私聊创建后双方所有在线 socket 自动 `join`。多标签页（多 socket）优化：仅第一个 socket 广播上线状态。

## 令牌与刷新流程
1. 登录成功：后端生成 `AccessToken`（15m）+ `RefreshToken`（30d，HttpOnly Cookie）。
2. 前端将 `AccessToken` 注入请求头；若响应 `401 TOKEN_EXPIRED`：
	 - 若已有刷新进行中，将当前请求 Promise 进入 `failedQueue` 等待。
	 - 刷新成功后：重放队列，统一使用新的 AccessToken。
3. 刷新失败：执行登出逻辑，清空状态。

## 游标分页模式
- 统一使用 `createdAt` 降序 + `cursor=ISODate`（表示“加载更早”）。
- 响应包含 `nextCursor`；前端若为空则无更多数据。
- 避免 skip 带来的性能问题，适合时间线与消息场景。

## 工程规范

| 项目 | 规范 |
|------|------|
| 代码风格 | Prettier（禁用分号、单引号、120列、Tailwind 排序）|
| 导入顺序 | ESLint `import/order` 分组 + 字母排序 + 组间空行 |
| 提交消息 | `npm run commit` 交互式：支持 feat/fix/docs 等 + emoji |
| 提交钩子 | Husky + lint-staged（JS/TS/Vue 自动修复，JSON/MD/HTML Prettier）|

## 快速开始

```powershell
git clone https://github.com/Hahanic/momoTwitter.git
cd momoTwitter
cp backend/.env.example backend/.env   # 如需，可自行创建示例文件
cp frontend/.env.example frontend/.env # 设置 VITE_API_BASE_URL & VITE_BASE_URL
npm install
npm run dev
```

浏览器访问：
- 前端：`http://127.0.0.1:5173`
- 后端（API）：`http://127.0.0.1:3000/api`

## 常见问题 (FAQ)

| 问题 | 说明 |
|------|------|
| 401 Token 过期频繁 | 检查本地时间是否同步，确认 JWT_SECRET 一致，并正确携带 Cookie（刷新接口需要）。|
| 图片无法访问 | 核对 `CLOUDFLARE_R2_PUBLIC_URL`，需为实际绑定的公开域名或默认访问前缀。|
| AI 翻译失败 | 确认 `QINIU_AI_API_KEY` 有效；网络是否可访问七牛云接口。|
| Mongo 鉴权失败 | 若未启用鉴权，删除 `MONGO_USER` / `PASSWORD` 并调整连接配置。|

## 待办与改进

短期：
- ✅ README 补充（当前）
- 添加单元测试（Jest / Vitest）覆盖核心服务（PostService、鉴权、分页）
- 引入 API 文档生成（OpenAPI / Swagger）
- 增加速率限制与安全（helmet、express-rate-limit）
- 图片类型 & 大小验证（MIME 白名单 / 限制）

中期：
- 消息撤回 / 编辑、打字状态、已读回执广播
- AI 流式聊天的前端增量渲染与取消控制
- 分布式缓存（Redis）做热门帖子计数与会话未读加速
- 分页性能优化：索引策略（复合索引 `authorId+createdAt` / `parentPostId+createdAt`）

长期：
- CI/CD：GitHub Actions 自动测试 + 构建 + Docker 镜像
- 观察性：接入日志聚合与 APM（OpenTelemetry）
- 微服务拆分（用户 / 帖子 / 聊天 / AI）与事件总线

## License

本项目采用 [MIT License](LICENSE) 开源。

---

欢迎提出 Issue 或 PR！如果本项目对你有帮助，别忘了 Star ⭐。

