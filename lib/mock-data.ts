export const mockScriptData = {
  project: {
    schema_version: "1.0",
    title: "雨夜旧宅改编短剧",
    created_at: "2026-06-06",
    language: "zh-CN",
  },
  source: {
    input_type: "sample_text",
    chapter_count: 3,
    chapters: [
      {
        id: "CH001",
        title: "第一章 雨夜来信",
        summary: "林晚收到父亲失踪前留下的信，决定回到旧宅调查。",
      },
      {
        id: "CH002",
        title: "第二章 旧宅密室",
        summary: "林晚在书房发现密室入口和父亲留下的录音。",
      },
      {
        id: "CH003",
        title: "第三章 失踪真相",
        summary: "林晚发现父亲失踪与家族旧案有关。",
      },
    ],
  },
  story_bible: {
    characters: [
      {
        id: "C001",
        name: "林晚",
        role: "主角",
        personality: "冷静、执着、敏感",
        goal: "查清父亲失踪真相",
        source_refs: ["REF001"],
      },
      {
        id: "C002",
        name: "林父",
        role: "关键人物",
        personality: "谨慎、隐忍",
        goal: "保护女儿并揭开旧案",
        source_refs: ["REF001", "REF002"],
      },
    ],
    relationships: [
      {
        from: "C001",
        to: "C002",
        type: "父女",
        description: "林晚追查父亲失踪真相，林父留下线索保护她。",
        source_refs: ["REF001"],
      },
    ],
    worldbuilding: {
      setting: "现代都市中的旧宅悬疑故事",
      rules: ["旧宅密室保存着家族旧案线索。"],
      locations: ["林家旧宅", "书房密室"],
      tone: "悬疑、压抑、逐步揭露",
    },
    key_events: [
      {
        id: "E001",
        summary: "林晚收到父亲失踪前留下的信。",
        characters: ["C001", "C002"],
        source_refs: ["REF001"],
      },
    ],
  },
  adaptation: {
    genre: "悬疑",
    strategy: "冲突强化",
    output_mode: "short_drama",
  },
  script: {
    scenes: [
      {
        id: "S001",
        title: "雨夜回到旧宅",
        location: "林家旧宅门口",
        time: "夜晚",
        summary: "林晚冒雨回到旧宅，发现门缝中夹着父亲留下的旧信。",
        characters: ["C001"],
        conflict: "林晚害怕旧宅，却必须进入寻找父亲线索。",
        shots: [
          {
            id: "SH001",
            visual: "雨夜中，林晚站在旧宅门前，手电光照亮斑驳木门。",
            camera: "远景",
            action_summary: "林晚缓慢推开木门。",
            dialogue_summary: "林晚低声说：爸，我回来了。",
          },
        ],
        dialogues: [
          {
            character: "C001",
            text: "爸，我回来了。",
            tone: "压抑、紧张",
          },
        ],
        actions: [
          {
            character: "C001",
            text: "她握紧手电，推开吱呀作响的木门。",
          },
        ],
        source_refs: ["REF001"],
      },
    ],
  },
  metadata: {
    validation_status: "passed",
    warnings: [
      {
        code: "MOCK_OUTPUT",
        message: "当前结果为 Mock 示例，用于本地演示。",
      },
    ],
    source_refs: [
      {
        id: "REF001",
        chapter_id: "CH001",
        description: "林晚收到父亲失踪前留下的信。",
      },
      {
        id: "REF002",
        chapter_id: "CH002",
        description: "书房密室中出现父亲录音。",
      },
    ],
  },
} as const;

export const sampleNovelText = `第一章 雨夜来信
林晚在深夜收到一封没有署名的信，信纸上只有父亲熟悉的字迹。信里写着：如果你看到这封信，就回旧宅找书房里的录音。

第二章 旧宅密室
林晚回到多年无人居住的林家旧宅，在书房书柜后发现一扇暗门。密室里放着一台旧录音机，里面传出父亲压低声音留下的线索。

第三章 失踪真相
录音指向一桩被家族隐藏多年的旧案。林晚意识到父亲并不是普通失踪，而是在失踪前试图把真相留给她。`;

export const mockYamlText = `project:
  schema_version: "1.0"
  title: "雨夜旧宅改编短剧"
  created_at: "2026-06-06"
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
      description: "林晚追查父亲失踪真相，林父留下线索保护她。"
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
      summary: "林晚收到父亲失踪前留下的信。"
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
`;
