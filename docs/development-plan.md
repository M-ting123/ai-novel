# Novel2Script YAML Studio — 开发执行计划

## PR 执行顺序

```
PR1 → PR2 → PR3 → PR4 → PR5 → PR6 → PR7 → 部署Vercel → PR8 → PR9 → PR10 → PR11 → README + UI整理
```

每个 PR 在前一个 PR 验收通过后执行；允许后续 PR 依赖前序结果，但不提前实现后续 PR 的功能。

---

## PR1：项目初始化 + Mock 数据 + YAML 文本展示

### 目标

用 `create-next-app` 初始化 Next.js + TypeScript + Tailwind 项目（App Router）。写入 Mock 数据（TS object + YAML 文本双形态）。`app/page.tsx` 用 `<pre>` 渲染 Mock YAML 文本。

### 初始化风险

当前仓库不是空目录，已有 `AGENTS.md`、`README.md`、`docs/`、`.agents/`。初始化时：
- 不能覆盖现有 `AGENTS.md`、`README.md`、`docs/`
- 如 `create-next-app` 提示非空目录，使用确认参数继续，但必须保护上述文件
- 如生成的新 `AGENTS.md` 或 `README.md` 与现有冲突，保留现有的

### Mock 数据最低要求

- 对齐 schema.md 6 个顶层模块：project / source / story_bible / adaptation / script / metadata
- 3 个章节
- story_bible 至少 2 个 characters + 1 个 relationship + 1 个 key_event
- script.scenes 至少 1 个 scene，scene 内至少 1 个 shot
- 双形态：TS object（供后续代码读取）+ YAML 文本字符串（供页面展示）

### 不做什么

不做复制按钮、不做下载按钮、不做输入框、不做配置选择、不做校验面板、不做剧本预览、不做分镜预览、不做 AI 调用、不建 `components/` 目录、不建 `types/` `utils/` `hooks/` 目录、不引入第三方依赖（除 create-next-app 自带）

### 涉及文件

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `lib/mock-data.ts`
- `package.json`
- Next/Tailwind 必要配置文件（如 `postcss.config.*`、`next.config.*` 等，以实际初始化结果为准）

### 验收标准

1. 终端执行 `npm run dev` 后浏览器访问 `localhost:3000` 可看到 Mock YAML 文本
2. Mock YAML 包含 project / source / story_bible / adaptation / script / metadata 6 个顶层模块
3. story_bible 包含 ≥2 个 characters、≥1 个 relationship、≥1 个 key_event
4. script.scenes 包含 ≥1 个 scene，scene 内包含 ≥1 个 shot
5. 页面无报错、无崩溃
6. 项目中不存在 `components/` `types/` `utils/` `hooks/` 目录

---

## PR2：复制 YAML + 下载 YAML 文件

### 目标

在 `app/page.tsx` 中添加"复制"按钮和"下载"按钮。复制使用 `navigator.clipboard.writeText()`，成功后显示提示。下载使用 `URL.createObjectURL` + `<a download>` 生成 .yaml 文件下载。

### 不做什么

不新建 `components/` 目录、不建 `components/CopyDownloadBar.tsx`、不改 Mock 数据、不做剧本预览、不做分镜预览、不做校验、不做输入框、不做 AI 调用

### 涉及文件

- `app/page.tsx`（新增两个按钮 + 事件处理逻辑）

### 验收标准

1. 用户点击"复制"按钮后，Mock YAML 文本被复制到剪贴板
2. 复制成功后页面显示"已复制"或类似提示
3. 用户点击"下载"按钮后，浏览器下载一个 .yaml 文件
4. 下载文件内容与页面展示的 YAML 文本一致
5. 复制/下载失败时页面不崩溃

---

## PR3：剧本场景预览

### 目标

从 Mock TS object 的 `script.scenes` 读取数据。新建 `components/SceneCard.tsx` 渲染场景卡片，显示：场景标题(title)、地点(location)、时间(time)、摘要(summary)、出场人物(characters)、对白列表(dialogues：说话人+内容+语气)、动作列表(actions)。场景卡片间用分隔线区分。

### 不做什么

不做分镜内容展示（shots 留给 PR4）、不做校验面板、不做输入框、不建 components 子目录、不修改 Mock 数据、不修改复制/下载按钮

### 涉及文件

- `components/SceneCard.tsx`（新建）
- `app/page.tsx`（引入 SceneCard）

### 验收标准

1. 页面渲染 ≥1 个场景卡片
2. 卡片包含标题、地点、时间、摘要
3. 卡片显示出场人物列表
4. 卡片显示对白（说话人名字 + 对白内容 + 语气）
5. 卡片显示动作
6. 多个场景之间有视觉分隔
7. 页面不崩溃

---

## PR4：分镜预览

### 目标

从 Mock TS object 的 `script.scenes[].shots` 读取数据。新建 `components/ShotCard.tsx` 渲染分镜卡片，显示：画面描述(visual)、镜头提示(camera)、动作摘要(action_summary)、对白摘要(dialogue_summary)。分镜按场景分组展示，显示所属场景标题。

### 不做什么

不做分镜编辑、不做分镜时长、不做转场效果、不做视频生成参数、不做故事板视图、不修改 SceneCard、不修改 Mock 数据

### 涉及文件

- `components/ShotCard.tsx`（新建）
- `app/page.tsx`（引入 ShotCard）

### 验收标准

1. 页面渲染 ≥1 个分镜卡片
2. 卡片包含画面描述(visual)
3. 卡片包含镜头提示(camera)
4. 卡片包含动作摘要(action_summary)和对白摘要(dialogue_summary)
5. 分镜按所属场景分组展示，能看到场景标题
6. 分镜只展示 schema.md §8.2 定义的 5 个字段，不出现额外字段
7. 页面不崩溃

---

## PR5：Schema 校验

### 目标

新建 `lib/validate-schema.ts` 纯函数（输入 YAML object → 输出校验结果数组，每条结果含 rule/field/passed/message）。按 schema.md §11 的 8 条规则逐条校验 Mock TS object。新建 `components/ValidationPanel.tsx` 展示校验结果（通过 X 条 / 失败 Y 条，失败项显示 rule 名称 + message）。

### 设计约束

- 校验函数是纯函数即可，不需要做成通用校验框架
- 第一版只校验当前生成结果，不追求"可扩展规则引擎"
- 8 条规则硬编码，不要建规则配置文件

### 不做什么

不做实时校验、不做 JSON Schema 机器校验、不做自动修复、不做校验规则编辑器、不修改 Mock 数据、不修改 SceneCard/ShotCard、不做输入框

### 涉及文件

- `lib/validate-schema.ts`（新建）
- `components/ValidationPanel.tsx`（新建）
- `app/page.tsx`（引入 ValidationPanel）

### 验收标准

1. 页面展示校验结果面板
2. 面板显示"通过 X 条 / 失败 Y 条"汇总
3. 每条失败项显示可理解的 message
4. Mock 数据通过全部 8 条校验（Mock 相关 warning 不算失败）
5. 校验失败不会导致页面崩溃

---

## PR6：小说输入 + 配置选择

### 目标

新建 `components/NovelInput.tsx`（textarea 输入框 + 章节数量判断 + "使用示例文本"一键填充按钮）。新建 `components/ConfigSelector.tsx`（题材下拉：悬疑/都市/玄幻/言情/通用 + 策略下拉：忠实改编/压缩改编/冲突强化 + 默认值）。输入为空时提示。章节不足 3 章时提示。点"生成"按钮后继续返回 Mock 数据。

### 组件约束

- 只拆 NovelInput.tsx 和 ConfigSelector.tsx 两个组件
- 不要再拆 GenerateButton、StatusPanel 等小组件

### 不做什么

不做 AI API 调用、不建 `app/api/`、不做 .txt 文件上传、不做章节自动分割、不做字数统计、不修改 Mock 数据、不修改校验逻辑、不修改预览组件

### 涉及文件

- `components/NovelInput.tsx`（新建）
- `components/ConfigSelector.tsx`（新建）
- `app/page.tsx`（引入两个新组件 + 生成按钮逻辑）

### 验收标准

1. 页面显示小说文本输入框
2. 页面显示题材下拉选择（5 个选项，默认"通用"）
3. 页面显示策略下拉选择（3 个选项，默认"忠实改编"）
4. 输入少于 3 章内容时显示"章节不足"提示
5. 输入为空时显示错误提示
6. 点击"使用示例文本"自动填充 Mock 对应的原文
7. 点"生成"按钮后展示 Mock 数据，不调用外部 API
8. 页面不崩溃

---

## PR7：AI API Route + 真实生成 + Mock Fallback

### 目标

新建 `app/api/generate/route.ts`（POST 接收输入文本 + 题材 + 策略 → 拼 prompt（含 schema.md 结构约束）→ 调用大模型 API → 返回 YAML）。`app/page.tsx` 中"生成"按钮改为调用 API Route。展示生成结果。保留 "使用 Mock 示例" 开关作为 fallback（默认 Mock 可用，API 只是增强）。生成中显示 loading 状态。生成失败显示错误提示并自动降级 Mock。30s 超时处理。

### 风险提示

- PR7 是这个 PR 序列中风险最高的一个
- PR7 失败不能影响前面 PR1-PR6 的 demo 效果
- useMock 开关必须始终可用且默认可靠

### 不做什么

不做流式输出（SSE）、不做多模型切换、不做 prompt 模板管理、不做生成历史、不做结果对比、不做模型参数面板

### 涉及文件

- `app/api/generate/route.ts`（新建）
- `app/page.tsx`（改造生成按钮逻辑 + fallback 开关）
- `lib/validate-schema.ts`（复用，不改）

### 验收标准

1. 用户输入 ≥3 章文本 + 选择配置 → 点"生成" → 系统调用 AI API → 返回结构化 YAML
2. 返回的 YAML 通过 PR5 的 Schema 校验（或明确标注 warning）
3. 生成中显示 loading 状态
4. 生成失败（API key 缺失/网络错误/超时）时页面不崩溃，显示错误提示，自动降级到 Mock 数据
5. 用户可手动切换"使用 Mock 示例"查看 Mock 数据
6. 30s 无响应时超时提示

---

## PR8：服务器解析 YAML + 页面状态提示

### 目标

- 安装 `js-yaml`（`npm install js-yaml`）
- 在 `app/api/generate/route.ts` 里，AI 返回 YAML 文字后，用 `yaml.load()` 翻译成 JS object
- API 返回内容从 `{ yamlText, usedMock, message }` 变成 `{ yamlText, parsedData, usedMock, message }`
- `app/page.tsx` 拿到 `parsedData` 后先存起来（暂不传给任何面板），在页面显示一行"解析成功"或"解析失败"

### 不做什么

- 不把 parsedData 传给校验面板
- 不把 parsedData 传给场景预览
- 不把 parsedData 传给分镜预览
- 不新增故事资产面板

### 涉及文件

- `app/api/generate/route.ts`（加 js-yaml 解析 + 返回 parsedData）
- `app/page.tsx`（接收 parsedData + 显示解析状态）

### 验收标准

1. 点生成后，API 返回内容里包含 `parsedData` 字段
2. 解析成功时页面显示绿字"解析成功"
3. 解析失败时页面显示红字"解析失败"，自动降级 Mock
4. 其他面板暂时不受影响

---

## PR9：校验面板接上真数据

### 目标

- 把 `validate-schema.ts` 的输入从 Mock 数据换成 API 返回的 `parsedData`
- 校验面板变成真的在检查 AI 生成结果，而不是永远"8 条全过"
- 如果 AI 返回字段不完整，校验面板负责指出缺失或不符合规则的地方

### 不做什么

- 不改场景预览
- 不改分镜预览
- 不新增故事资产面板
- 不为了让校验通过而伪造 AI 没有返回的字段

### 涉及文件

- `app/page.tsx`（校验面板改用 parsedData）
- `lib/validate-schema.ts`（如需要，增强对 AI 返回数据的安全检查）

### 验收标准

1. 用 Mock 数据时校验面板仍然"8 条全过"
2. 用 AI 生成数据时校验面板显示真实检查结果（可能有过有不过）
3. 解析失败时校验回退到 Mock 数据
4. AI 少字段时页面不崩溃，校验面板显示可理解的失败信息

---

## PR10：场景预览 + 分镜预览接上真数据

### 目标

- 场景预览从 `parsedData.script.scenes` 读数据（不再读 Mock）
- 分镜预览从 `parsedData.script.scenes[].shots` 读数据
- 优先要求 AI 按 `schema.md` 输出完整字段；页面只做防崩溃兜底，不替 AI 编造缺失内容
- 输入什么故事，卡片就尽量显示该故事的真实场景和分镜

### 不做什么

- 不新增故事资产面板
- 不做自动补全 AI 缺失字段
- 不为了展示效果伪造人物、场景或分镜
- 不改 Prompt 主结构，Prompt 强约束放在 PR8 或 PR9 中处理

### 涉及文件

- `app/page.tsx`（场景和分镜数据源切换）
- `components/SceneCard.tsx`（仅在需要防崩溃兜底时最小修改）
- `components/ShotCard.tsx`（仅在需要防崩溃兜底时最小修改）

### 验收标准

1. AI 返回完整 Schema 时，场景卡片显示该故事的真实场景
2. AI 返回完整 Schema 时，分镜卡片显示该故事的真实分镜
3. AI 少字段时页面不崩溃，而是显示"暂无对白"、"暂无分镜"等空状态
4. 页面不伪造缺失内容
5. 解析失败时场景和分镜回退到 Mock 数据或显示解析失败提示

---

## PR11：新增故事资产面板

### 目标

- 新建 `components/StoryBiblePanel.tsx`
- 展示 AI 拆出来的：人物列表（姓名+性格+目标）、人物关系（谁和谁+什么关系）、世界观设定（背景+规则+地点+基调）、关键事件
- 放在生成按钮下方、校验面板上方

### 不做什么

- 不改校验面板
- 不改场景/分镜预览

### 涉及文件

- `components/StoryBiblePanel.tsx`（新建）
- `app/page.tsx`（引入面板 + 传 parsedData.story_bible）

### 验收标准

1. 页面显示人物拆解（姓名、性格、目标）
2. 页面显示人物关系（从谁→到谁、关系类型、说明）
3. 页面显示世界观（背景、规则、地点、基调）
4. 页面显示关键事件
5. 解析失败时回退到 Mock 数据

---

## 收尾

```
PR8-PR11 全部做完 → 写 README（放截图） → UI 整理（校验弹窗、排版调整） → 最终提交
```

### 完成后页面效果

```
小说输入 → 选配置 → 点生成 → 调DeepSeek → 返回YAML
                                              │
                          ┌─────────────────────┤
                          ▼                     ▼
                   故事资产面板            校验结果
                   (人物/关系/世界观/事件)   (通过X条/失败Y条)
                          │
                          ▼
                   场景预览 + 分镜预览
                          │
                          ▼
                   YAML文字 + 复制/下载
```
