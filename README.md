# Novel2Script YAML Studio

小说转短剧剧本 YAML 的 72h MVP 项目。

面向小说作者和短剧创作者：输入 3 章以上小说文本，选择题材和改编策略，系统生成结构化 YAML，并同步展示故事资产、Schema 校验、场景预览和分镜预览。

## 在线体验

**[gilded-bunny-74071f.netlify.app](https://gilded-bunny-74071f.netlify.app)**

没有 API Key 时可勾选"使用 Mock 示例"体验完整流程。

## 核心能力

- 输入小说文本，支持示例文本一键填充
- 选择题材类型（悬疑/都市/玄幻/言情/通用）和改编策略（忠实改编/压缩改编/冲突强化）
- 调用 DeepSeek API 生成剧本 YAML
- 故事资产拆解：人物、人物关系、世界观、关键事件
- Schema 校验（通过/失败 + 来源标注）
- 剧本场景预览（标题、地点、时间、摘要、对白、动作）
- 分镜预览（画面描述、镜头提示、动作摘要、对白摘要）
- 复制和下载 YAML 文件
- API 失败或未配置 Key 时自动回退 Mock 示例

## 技术栈

- Next.js App Router + React + TypeScript
- Tailwind CSS
- js-yaml
- DeepSeek Chat Completions API

## 项目结构

```
.
├── app/
│   ├── api/generate/route.ts   ← DeepSeek API 调用 + YAML 解析
│   ├── page.tsx                ← 主页面
│   ├── layout.tsx              ← 根布局
│   └── globals.css             ← Tailwind 样式
├── components/
│   ├── StoryBiblePanel.tsx     ← 故事资产面板
│   ├── SceneCard.tsx           ← 场景卡片
│   ├── ShotCard.tsx            ← 分镜卡片
│   ├── ValidationPanel.tsx     ← Schema 校验面板
│   ├── NovelInput.tsx          ← 小说文本输入
│   └── ConfigSelector.tsx      ← 题材与策略选择
├── lib/
│   ├── mock-data.ts            ← Mock 示例数据
│   └── validate-schema.ts      ← Schema 校验逻辑
├── docs/
│   ├── requirements.md         ← 需求分析
│   ├── schema.md               ← YAML Schema 设计
│   └── development-plan.md     ← 开发执行计划
├── AGENTS.md                   ← 项目协作规则
└── README.md
```

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000

## 环境变量

复制 `.env.example` 为 `.env.local`，填写 DeepSeek API Key：

```env
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_MODEL=deepseek-v4-flash
```

API Key 只在服务端 `app/api/generate/route.ts` 中使用，不会暴露到前端。

## Demo 流程

1. `npm install && npm run dev`，打开 http://localhost:3000
2. 点击 **"使用示例文本"** 自动填入 3 章示例小说
3. 题材选 **"悬疑"**，策略选 **"冲突强化"**
4. 勾选 **"使用 Mock 示例"**（无需 API Key 即可跑通）
5. 点击 **"生成 YAML"**
6. 查看故事资产 → Schema 校验 → 场景预览 → 分镜预览
7. 点击 **"复制 YAML"** 或 **"下载 YAML"**

> 如需真实 AI 生成：配置 `.env.local` 中的 `DEEPSEEK_API_KEY`，取消勾选"使用 Mock 示例"，重新生成即可。

## Mock 兜底

未配置 API Key 或请求失败时，页面自动回退 Mock 示例。保证评审和本地测试时即使没有 API Key 也能演示完整流程。

## 部署

已部署至 Netlify：**[gilded-bunny-74071f.netlify.app](https://gilded-bunny-74071f.netlify.app)**

如需自行部署：`npm run build` 后部署 `out/` 目录，或直接推送 GitHub 仓库到 Netlify/Vercel，设置环境变量 `DEEPSEEK_API_KEY` 即可。

## 项目文档

- [需求分析](docs/requirements.md)
- [YAML Schema 设计](docs/schema.md)
- [开发执行计划](docs/development-plan.md)

## 第一版边界

第一版专注完成"小说文本 → 结构化 YAML → 校验与预览"闭环。

暂不做：登录、数据库、复杂编辑器、模板市场、视频生成、多用户协作。
