# Novel2Script YAML Studio — 开发执行计划

## PR 执行顺序

```
PR1 → PR2 → PR3 → PR4 → PR5 → PR6 → PR7 → 部署Vercel → PR8 → PR9 → PR10 → PR11 → UI/上传入口 → 后续修改重生成 → README + Demo 整理
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

## PR12-PR22 实际迭代记录

PR1-PR11 完成了项目从 Mock YAML、复制下载、校验、真实 API、解析、真数据预览到故事资产面板的核心功能。PR12 之后的重点转向“把功能整理成一个能演示的产品”：补 README、优化首页、重做上传入口、整理生成工作台、加入工具箱弹窗、统一 UI 风格，并在最后补上后续修改重生成能力。

### PR12：补全 README 项目说明

目标：让仓库入口能说明 Novel2Script 是什么、给谁用、怎么运行、怎么演示。

实际完成：

1. 补充项目定位、核心能力、本地运行方式、环境变量和 Demo 流程。
2. 说明 Mock 兜底，保证没有 API Key 时也能跑通演示。
3. 明确第一版边界，暂不做登录、数据库、复杂编辑器和视频生成。

### PR13：首页轮播插画和视觉资源

目标：让首页不只是文字说明，而是有可展示的视觉信号。

实际完成：

1. 新增 5 张无文字插画资源。
2. 首页轮播卡片改为上方文案、下方插画展示。
3. 让首页能展示“输入小说、生成 YAML、故事资产、Schema 校验、复制下载”等能力。

### PR14：开始弹窗和输入后自动生成流程

目标：把首页的“开始”按钮变成真正的小说输入入口。

实际完成：

1. 新增 `StartInputModal`。
2. 点击首页“开始”后打开输入弹窗。
3. 用户点击“生成 YAML”后进入工作台并立即开始生成。
4. 默认不勾选 Mock 示例，让真实生成路径更清楚，同时仍保留 Mock 兜底。

### PR15：工作台左侧状态区和故事资产侧栏适配

目标：把生成页整理成更像工作台的布局。

实际完成：

1. 生成页改为左侧返回和状态区、中间主内容的结构。
2. 生成完成和 Schema 校验状态移动到左侧操作区下方。
3. `StoryBiblePanel` 调整为更适合侧栏或弹窗展示的布局。

### PR16：剧本工具箱和生成任务列表

目标：让故事资产、场景、分镜不再全部堆在页面里，而是变成用户可点击的工具入口。

实际完成：

1. 新增剧本工具箱卡片。
2. 点击工具卡片后生成对应任务。
3. 右侧生成结果列表展示“生成中”和“已生成”状态。

### PR17：任务详情弹窗和配置恢复

目标：让用户点击已生成任务后能查看具体内容，同时恢复生成配置。

实际完成：

1. 已生成任务支持点击打开详情弹窗。
2. 恢复题材类型和改编策略选择。
3. 继续把题材和策略传入生成请求。

### PR18：三栏 YAML 工作台

目标：让生成页更像稳定的 YAML 工作台。

实际完成：

1. 页面改为左侧返回和状态栏、中间 YAML 主工作区、右侧工具箱。
2. 生成、校验、解析状态支持点击查看详情。
3. YAML 输出成为页面的主工作区，工具箱和任务记录放到右侧。

### PR19：首页重新设计

目标：让首页更像产品入口，而不是普通工程页面。

实际完成：

1. 首页改为居中标题、左侧介绍、右侧轮播卡片。
2. 增强主按钮视觉层级。
3. 让用户更清楚第一步是从小说内容开始生成剧本 YAML。

### PR20：上传弹窗优化为 Source 上传入口

目标：让“开始创作”后的输入入口更清楚。

实际完成：

1. 上传弹窗改为大拖拽区。
2. 保留粘贴文本入口。
3. 强化主生成按钮，让“上传/粘贴小说 -> 生成 YAML”路径更直接。

### PR21：统一入戏风格页面和上传弹窗

目标：把首页、工作台和上传弹窗统一成更完整的“入戏 InScene”视觉风格。

实际完成：

1. 首页改为米色背景、黑色主按钮和“入戏 InScene”品牌入口。
2. YAML 工作台左侧状态区、中间输出区、右侧工具箱统一成米色卡片风格。
3. 上传弹窗同步改为米色/黑色风格，避免点击开始创作后出现纯白蓝色断层。

### PR22：后续修改要求和收尾文档

目标：在不引入复杂聊天系统的前提下，给用户一个继续修改生成结果的入口，并整理最后 Demo 文档。

实际完成：

1. 在左侧状态栏新增“后续修改要求”输入框。
2. 点击“提交修改”后复用当前小说文本、题材、策略和修改要求重新生成 YAML。
3. 后端 API 接收 `revisionInstruction`，并在 prompt 中追加“额外改编要求”。
4. 修复故事资源拆解弹窗标题重复问题，只保留内层“故事资产拆解”标题。
5. README 补充当前最终 Demo 流程、Mock 兜底、后续修改重生成和第一版边界。
6. development-plan 补充功能冻结、PR12-PR22 实际迭代记录和当前 PR 后续安排。

PR22 之后不再继续扩功能，进入录制 Demo、检查工作区、最终提交阶段。

---

## 当前收尾计划（功能冻结阶段）

当前项目已经进入最后收尾阶段。后续目标不是继续扩功能，而是把已经完成的闭环整理成可解释、可演示、可提交的作品。

### 已确认的当前闭环

```text
首页进入
→ 上传 .txt 或粘贴小说文本
→ 选择题材类型和改编策略
→ 生成剧本 YAML
→ 展示解析、校验、故事资产、场景和分镜
→ 复制或下载 YAML
→ 在左侧填写后续修改要求
→ 提交修改并重新生成 YAML
```

### 最后阶段原则

1. 功能冻结：不再新增聊天历史、数据库、登录、模板市场、视频生成或复杂编辑器。
2. 保护 Demo：优先保证本地启动、Mock 兜底、真实 API fallback、复制下载和预览稳定。
3. 文档优先：README 作为评委入口，development-plan 记录 PR 计划和取舍原因。
4. 后续修改只做“提交要求并重生成 YAML”，不升级为多轮聊天或局部 YAML 编辑。
5. 如果最后还有 PR，优先做 README、Demo 流程、风险说明和提交说明，不再做高风险功能。

### 最后几个 PR 的定位

#### UI/上传入口 PR

目标：把首页、工作台、上传弹窗统一成“入戏 InScene”的米色/黑色风格，并让用户从“开始创作”进入上传或粘贴小说来源。

验收标准：

1. 首页显示清晰品牌入口。
2. 点击“开始创作”后，弹窗色系和首页一致。
3. 用户可以上传 `.txt`、粘贴文本或使用示例文本。
4. 不改变生成逻辑。

#### 后续修改重生成 PR

目标：在左侧状态栏加入“后续修改要求”，用户可以填写额外要求并点击“提交修改”，系统重新生成修改后的 YAML。

验收标准：

1. 修改输入框与左侧生成/校验/解析状态同列对齐。
2. 点击“提交修改”会复用当前小说文本、题材、策略和修改要求重新生成 YAML。
3. 后端 prompt 在用户填写内容时追加“额外改编要求”。
4. 下方题材/策略/生成/复制/下载区域保持原布局。

#### README + Demo 整理 PR

目标：把当前最终形态写清楚，让评委和自己都能按 README 复现完整 Demo。

验收标准：

1. README 说明项目是什么、给谁用、解决什么问题。
2. README 包含本地运行、API Key、Mock 兜底和 Demo 步骤。
3. README 明确第一版边界和不做事项。
4. development-plan 记录当前功能冻结和最后阶段取舍。

---

## 收尾

```
当前 PR22 → 修复弹窗重复标题 → README + development-plan 最终整理 → 本地验证 → 准备 Demo 视频 → 最终提交
```

### 当前 PR 后续安排

当前 PR 之后不再扩展新功能，只做收尾、验证和演示准备。

1. **修复 UI 小问题**
   - 已发现故事资源拆解弹窗会同时显示外层任务标题和内层面板标题。
   - 处理方式：故事资源拆解弹窗隐藏外层标题，只保留 `StoryBiblePanel` 内部的“故事资产拆解”标题和说明。
   - 不改变故事资产数据结构和生成逻辑。

2. **整理 README 和 planning**
   - README 作为评委入口，写清楚项目定位、运行方式、Demo 流程、Mock 兜底和第一版边界。
   - `development-plan.md` 记录当前功能冻结、最后几个 PR 的取舍和当前 PR 之后的安排。

3. **本地验证**
   - 每个收尾 PR 都至少跑：
     ```bash
     npm.cmd run lint
     npm.cmd run build
     ```
   - 手动检查首页、开始创作弹窗、YAML 工作台、后续修改、工具箱弹窗、复制和下载。

4. **Demo 视频准备**
   - 使用 Mock 模式录制，保证不依赖 API Key。
   - 展示流程：开始创作 → 使用示例文本 → 选择题材/策略 → 生成 YAML → 查看校验/故事资产/场景/分镜 → 后续修改重生成 → 复制/下载。
   - 视频中强调第一版边界：不做登录、数据库、多轮聊天、视频生成，优先保证 72h MVP 可运行和可解释。

5. **最终提交前检查**
   - 确认 `git status --short --branch` 中只提交本 PR 相关文件。
   - 不提交 `.claude/` 等无关目录。
   - 保持 main 分支可运行。

### 完成后页面效果

```
首页“开始创作”
  ↓
上传 .txt / 粘贴文本 / 使用示例文本
  ↓
选择题材类型 + 改编策略
  ↓
生成 YAML
  ↓
解析状态 + Schema 校验 + YAML 输出
  ↓
故事资产拆解 / 剧本场景预览 / 场景分镜预览
  ↓
左侧填写后续修改要求并提交重生成
  ↓
复制或下载 YAML
```

