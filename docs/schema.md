# Novel2Script YAML Schema 设计文档

## 1. 文档目标

本文档定义 Novel2Script YAML Studio 第一版的剧本 YAML 字段契约。

这个 Schema 主要服务后续四类实现：

1. AI 生成：约束大模型输出结构，避免只生成松散文本。
2. Mock 示例：让无 API key 的本地演示也能使用同一套字段。
3. YAML 校验：判断生成结果是否满足第一版核心结构。
4. 剧本/分镜预览：让页面可以稳定读取场景、对白、动作和基础分镜信息。

本文档不是机器可执行的 JSON Schema，也不包含完整类型系统。第一版先使用文档级字段契约，后续如需机器校验文件，可以在独立 PR 中补充。

## 2. 设计原则

### 2.1 结构化优先

小说原文是叙事文本，剧本需要被拆解成场景、动作、对白、人物和分镜。Schema 需要把这些内容拆成稳定字段，而不是让 AI 输出一整段不可复用文本。

### 2.2 可编辑优先

生成结果应该像一个剧本初稿资产包，作者可以复制、下载、修改和继续打磨。因此字段命名要清楚，结构要稳定。

### 2.3 来源可追溯

AI 改编容易乱加剧情或改变人物动机。`source_refs` 用来标记场景、事件或对白来自原小说的哪一章或哪个情节，帮助作者检查生成内容是否偏离原文。

### 2.4 第一版只做基础分镜

`shots` 只作为第一版基础分镜预览字段，用来展示画面、人物动作、对白摘要和镜头提示。它不是完整视频生成系统，也不包含复杂视频模型参数。

### 2.5 为未来扩展留位置

小说推文、戏剧模板库、角色原型库、视频生成提示词等能力可以在未来扩展，但不进入第一版必填结构，避免 72h MVP 过度膨胀。

## 3. 顶层结构

第一版 YAML 使用以下顶层模块：

```yaml
project:
source:
story_bible:
adaptation:
script:
metadata:
```

| 模块 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `project` | 是 | 描述项目、版本和生成任务基础信息 | 让每份 YAML 都能说明自己是什么、为哪个任务生成 |
| `source` | 是 | 描述原小说输入和章节来源 | 支撑 3 章以上要求和来源追溯 |
| `story_bible` | 是 | 存放人物、关系、世界观和关键事件 | 先抽取故事资产，再生成剧本，区别于普通 AI 改写 |
| `adaptation` | 是 | 存放题材类型和改编策略 | 让生成结果能体现用户选择，而不是固定风格 |
| `script` | 是 | 存放剧本场景、分镜、对白和动作 | 这是第一版的核心输出 |
| `metadata` | 是 | 存放生成状态、校验状态、警告和来源追溯 | 支撑校验、错误提示和 AI 乱改检查 |

## 4. `project` 模块

`project` 描述本次剧本生成任务的基础信息。

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `schema_version` | 是 | 标记当前 YAML 使用的 Schema 版本 | 后续字段升级时可以兼容旧结果 |
| `title` | 是 | 剧本项目标题 | 方便用户识别和下载结果 |
| `created_at` | 否 | 生成时间 | 方便记录 demo 或生成历史 |
| `language` | 是 | 内容语言，例如 `zh-CN` | 第一版主要面向中文小说，但保留语言标记 |

示例：

```yaml
project:
  schema_version: "1.0"
  title: "雨夜旧宅改编短剧"
  created_at: "2026-06-05"
  language: "zh-CN"
```

## 5. `source` 模块

`source` 描述输入小说和章节信息。

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `input_type` | 是 | 输入类型，例如 `paste_text` 或 `sample_text` | 区分用户输入和 Mock 示例 |
| `chapter_count` | 是 | 章节数量 | 校验是否满足 3 章以上要求 |
| `chapters` | 是 | 章节列表 | 支撑章节摘要、来源追溯和后续切分 |

`chapters` 内部字段：

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `id` | 是 | 章节 ID，例如 `CH001` | 供 `source_refs` 引用 |
| `title` | 否 | 章节标题 | 有标题时提升可读性 |
| `summary` | 是 | 章节摘要 | 让作者快速检查 AI 是否理解原文 |

示例：

```yaml
source:
  input_type: "paste_text"
  chapter_count: 3
  chapters:
    - id: "CH001"
      title: "第一章 雨夜来信"
      summary: "女主收到父亲失踪前留下的信，决定回到旧宅调查。"
```

## 6. `story_bible` 模块

`story_bible` 是故事资产集合，负责把小说内容转成可复用的改编素材。

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `characters` | 是 | 人物设定列表 | 剧本生成需要稳定人物身份、目标和性格 |
| `relationships` | 是 | 人物关系列表 | 防止 AI 丢失或误改人物关系 |
| `worldbuilding` | 是 | 世界观和背景设定 | 帮助短剧场景保持一致的故事环境 |
| `key_events` | 是 | 关键事件列表 | 支撑后续场景和冲突生成 |

### 6.1 `characters`

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `id` | 是 | 人物 ID，例如 `C001` | 供关系、场景、对白引用 |
| `name` | 是 | 人物名称 | 剧本展示和对白需要直接显示 |
| `role` | 是 | 人物定位，例如主角、反派、配角 | 帮助 AI 维持戏剧结构 |
| `personality` | 是 | 性格关键词 | 支撑对白和行为风格 |
| `goal` | 否 | 人物目标 | 帮助生成冲突和行动动机 |
| `source_refs` | 否 | 来源追溯 | 说明人物设定来自哪些章节或情节 |

### 6.2 `relationships`

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `from` | 是 | 关系起点人物 ID | 用结构化方式描述人物关系 |
| `to` | 是 | 关系终点人物 ID | 用结构化方式描述人物关系 |
| `type` | 是 | 关系类型，例如父女、敌对、合作 | 防止 AI 改错核心关系 |
| `description` | 否 | 关系说明 | 补充复杂关系细节 |
| `source_refs` | 否 | 来源追溯 | 让作者检查关系是否有原文依据 |

### 6.3 `worldbuilding`

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `setting` | 是 | 故事背景 | 支撑场景氛围和视觉描述 |
| `rules` | 否 | 世界规则或特殊设定 | 适配玄幻、悬疑等题材 |
| `locations` | 否 | 重要地点列表 | 支撑场景生成 |
| `tone` | 否 | 故事基调 | 帮助改编输出保持一致风格 |

### 6.4 `key_events`

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `id` | 是 | 事件 ID，例如 `E001` | 供场景和来源引用 |
| `summary` | 是 | 事件摘要 | 帮助把小说情节转成剧本节点 |
| `characters` | 否 | 相关人物 ID 列表 | 支撑场景人物安排 |
| `source_refs` | 是 | 来源追溯 | 关键事件必须有原文依据，降低乱编风险 |

## 7. `adaptation` 模块

`adaptation` 描述用户选择的改编配置。

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `genre` | 是 | 题材类型，例如悬疑、都市、玄幻、言情、通用 | 让生成结果贴合用户选择的题材 |
| `strategy` | 是 | 改编策略，例如忠实改编、压缩改编、冲突强化 | 控制保留原文程度和戏剧节奏 |
| `output_mode` | 是 | 第一版固定为 `short_drama` | 明确第一版主输出是短剧剧本 YAML |

默认值：

```yaml
adaptation:
  genre: "通用"
  strategy: "忠实改编"
  output_mode: "short_drama"
```

## 8. `script` 模块

`script` 是第一版的核心剧本输出，包含场景、基础分镜、对白和动作。

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `scenes` | 是 | 剧本场景列表 | 剧本必须按场景组织 |

### 8.1 `scenes`

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `id` | 是 | 场景 ID，例如 `S001` | 供分镜、对白、来源引用 |
| `title` | 是 | 场景标题 | 方便页面预览和作者理解 |
| `location` | 是 | 场景地点 | 剧本和分镜需要明确发生地点 |
| `time` | 否 | 时间，例如夜晚、清晨 | 支撑氛围和镜头描述 |
| `summary` | 是 | 场景摘要 | 让作者快速理解场景作用 |
| `characters` | 是 | 场景中出现的人物 ID 列表 | 支撑预览和对白归属 |
| `conflict` | 否 | 场景冲突 | 短剧需要明确冲突点 |
| `shots` | 是 | 基础分镜列表 | 第一版用于分镜预览，不是视频生成系统 |
| `dialogues` | 是 | 对白列表 | 剧本核心内容 |
| `actions` | 是 | 动作或表演提示列表 | 把小说叙事转成可演内容 |
| `source_refs` | 是 | 来源追溯 | 标记场景依据来自哪些章节或事件 |

### 8.2 `shots`

`shots` 只用于第一版基础分镜预览。它帮助用户看到场景如何被拆成画面，但不承担完整视频生成、镜头调度或视频模型参数配置。

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `id` | 是 | 分镜 ID，例如 `SH001` | 供预览排序和引用 |
| `visual` | 是 | 画面描述 | 帮助用户理解剧本画面感 |
| `camera` | 否 | 简单镜头提示，例如近景、远景、特写 | 支撑基础分镜预览 |
| `action_summary` | 否 | 人物动作摘要 | 把小说叙事转成可视化动作 |
| `dialogue_summary` | 否 | 对白摘要 | 方便分镜卡片展示 |

### 8.3 `dialogues`

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `character` | 是 | 说话人物 ID | 绑定对白和人物 |
| `text` | 是 | 对白内容 | 剧本核心输出 |
| `tone` | 否 | 语气或情绪 | 帮助作者理解表演方式 |

### 8.4 `actions`

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `character` | 否 | 执行动作的人物 ID | 动作可能属于人物，也可能属于环境 |
| `text` | 是 | 动作或表演提示 | 把小说叙事转成可执行剧本内容 |

## 9. `metadata` 模块

`metadata` 描述生成结果状态、校验信息、警告和来源追溯索引。

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `validation_status` | 是 | 校验状态，例如 `passed` 或 `failed` | 页面需要展示 Schema 校验结果 |
| `warnings` | 否 | 生成或校验风险提示 | 提醒作者可能存在章节不足、来源不明确等问题 |
| `source_refs` | 是 | 全局来源追溯列表 | 统一管理场景、人物、事件的来源依据 |

### 9.1 `source_refs`

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `id` | 是 | 来源引用 ID，例如 `REF001` | 供场景、事件、人物引用 |
| `chapter_id` | 是 | 来源章节 ID | 让作者知道生成内容来自哪一章 |
| `description` | 是 | 来源情节说明 | 帮助作者快速检查 AI 是否乱改 |

### 9.2 `warnings`

| 字段名 | 是否必填 | 字段作用 | 设计原因 |
| --- | --- | --- | --- |
| `code` | 否 | 警告代码 | 后续可用于程序判断 |
| `message` | 是 | 警告说明 | 用户需要看懂风险 |

## 10. 简化 YAML 示例

```yaml
project:
  schema_version: "1.0"
  title: "雨夜旧宅改编短剧"
  created_at: "2026-06-05"
  language: "zh-CN"

source:
  input_type: "sample_text"
  chapter_count: 3
  chapters:
    - id: "CH001"
      title: "第一章 雨夜来信"
      summary: "林晚收到父亲失踪前留下的信，决定回到旧宅调查。"
    - id: "CH002"
      title: "第二章 旧宅密室"
      summary: "林晚在书房发现密室入口和父亲留下的录音。"
    - id: "CH003"
      title: "第三章 失踪真相"
      summary: "林晚发现父亲失踪与家族旧案有关。"

story_bible:
  characters:
    - id: "C001"
      name: "林晚"
      role: "主角"
      personality: "冷静、执着、敏感"
      goal: "查清父亲失踪真相"
      source_refs: ["REF001"]
    - id: "C002"
      name: "林父"
      role: "关键人物"
      personality: "谨慎、隐忍"
      goal: "保护女儿并揭开旧案"
      source_refs: ["REF001", "REF002"]
  relationships:
    - from: "C001"
      to: "C002"
      type: "父女"
      description: "林晚追查父亲失踪真相。"
      source_refs: ["REF001"]
  worldbuilding:
    setting: "现代都市中的旧宅悬疑故事"
    rules:
      - "旧宅密室保存着家族旧案线索。"
    locations:
      - "林家旧宅"
      - "书房密室"
    tone: "悬疑、压抑、逐步揭露"
  key_events:
    - id: "E001"
      summary: "林晚收到父亲留下的信。"
      characters: ["C001", "C002"]
      source_refs: ["REF001"]

adaptation:
  genre: "悬疑"
  strategy: "冲突强化"
  output_mode: "short_drama"

script:
  scenes:
    - id: "S001"
      title: "雨夜回到旧宅"
      location: "林家旧宅门口"
      time: "夜晚"
      summary: "林晚冒雨回到旧宅，发现门缝中夹着父亲留下的旧信。"
      characters: ["C001"]
      conflict: "林晚害怕旧宅，却必须进入寻找父亲线索。"
      shots:
        - id: "SH001"
          visual: "雨夜中，林晚站在旧宅门前，手电光照亮斑驳木门。"
          camera: "远景"
          action_summary: "林晚缓慢推开木门。"
          dialogue_summary: "林晚低声说：爸，我回来了。"
      dialogues:
        - character: "C001"
          text: "爸，我回来了。"
          tone: "压抑、紧张"
      actions:
        - character: "C001"
          text: "她握紧手电，推开吱呀作响的木门。"
      source_refs: ["REF001"]

metadata:
  validation_status: "passed"
  warnings:
    - code: "MOCK_OUTPUT"
      message: "当前结果为 Mock 示例，用于本地演示。"
  source_refs:
    - id: "REF001"
      chapter_id: "CH001"
      description: "林晚收到父亲失踪前留下的信。"
    - id: "REF002"
      chapter_id: "CH002"
      description: "书房密室中出现父亲录音。"
```

## 11. 基础校验原则

第一版校验不需要覆盖完整类型系统，但至少应检查：

1. 顶层必须包含 `project`、`source`、`story_bible`、`adaptation`、`script`、`metadata`。
2. `source.chapter_count` 必须大于或等于 3。
3. `story_bible.characters`、`story_bible.relationships`、`story_bible.key_events` 至少存在空数组或有效列表。
4. `script.scenes` 至少包含 1 个场景。
5. 每个场景必须包含 `id`、`title`、`summary`、`characters`、`shots`、`dialogues`、`actions`、`source_refs`。
6. `shots` 只校验基础预览字段，不校验视频生成参数。
7. `metadata.validation_status` 必须存在。
8. 关键事件和场景应尽量包含 `source_refs`，没有来源时应在 `warnings` 中提示。

## 12. 未来扩展

以下能力可以在后续版本扩展，但不进入第一版必填字段：

- 小说推文模式：可扩展 `content_adaptation` 或 `social_rewrite` 模块。
- 戏剧模板库：可扩展 `adaptation.template` 字段。
- 角色原型库：可扩展 `story_bible.character_archetypes` 字段。
- 视频生成提示词：可扩展 `video_prompts` 模块。
- 自定义模板：可扩展 `template_config` 模块。

未来扩展必须继续避免直接复刻具体版权 IP、角色名、台词或桥段。模板应描述通用戏剧结构，而不是模仿具体作品内容。
