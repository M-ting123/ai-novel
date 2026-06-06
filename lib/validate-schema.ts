export type ValidationResult = {
  rule: string;
  field: string;
  passed: boolean;
  message: string;
};

type SourceRefList = readonly string[];

type StoryBible = {
  characters?: readonly unknown[];
  relationships?: readonly unknown[];
  key_events?: readonly {
    source_refs?: SourceRefList;
  }[];
};

type ScriptScene = {
  id?: string;
  title?: string;
  summary?: string;
  characters?: readonly string[];
  shots?: readonly unknown[];
  dialogues?: readonly unknown[];
  actions?: readonly unknown[];
  source_refs?: SourceRefList;
};

type ScriptData = {
  project?: unknown;
  source?: {
    chapter_count?: number;
  };
  story_bible?: StoryBible;
  adaptation?: unknown;
  script?: {
    scenes?: readonly ScriptScene[];
  };
  metadata?: {
    validation_status?: string;
    warnings?: readonly unknown[];
  };
};

function asScriptData(data: unknown): ScriptData {
  if (typeof data === "object" && data !== null && !Array.isArray(data)) {
    return data as ScriptData;
  }

  return {};
}

function hasTopLevelModules(data: ScriptData) {
  return [
    data.project,
    data.source,
    data.story_bible,
    data.adaptation,
    data.script,
    data.metadata,
  ].every(Boolean);
}

function hasArrayField(value: unknown) {
  return Array.isArray(value);
}

function hasSceneRequiredFields(scene: ScriptScene) {
  return Boolean(
    scene.id &&
      scene.title &&
      scene.summary &&
      Array.isArray(scene.characters) &&
      Array.isArray(scene.shots) &&
      Array.isArray(scene.dialogues) &&
      Array.isArray(scene.actions) &&
      Array.isArray(scene.source_refs),
  );
}

function hasSourceRefs(value: { source_refs?: SourceRefList }) {
  return Array.isArray(value.source_refs) && value.source_refs.length > 0;
}

function hasShotPreviewFields(shot: unknown) {
  return typeof shot === "object" && shot !== null && "id" in shot && "visual" in shot;
}

export function validateSchema(input: unknown): ValidationResult[] {
  const data = asScriptData(input);
  const scenes = Array.isArray(data.script?.scenes)
    ? data.script.scenes
    : [];
  const keyEvents = Array.isArray(data.story_bible?.key_events)
    ? data.story_bible.key_events
    : [];
  const sceneAndEventRefs = [...keyEvents, ...scenes];

  return [
    {
      rule: "R1",
      field: "top_level",
      passed: hasTopLevelModules(data),
      message:
        "必须包含 project、source、story_bible、adaptation、script、metadata 6 个顶层模块。",
    },
    {
      rule: "R2",
      field: "source.chapter_count",
      passed: (data.source?.chapter_count ?? 0) >= 3,
      message: "source.chapter_count 必须大于或等于 3。",
    },
    {
      rule: "R3",
      field: "story_bible",
      passed:
        hasArrayField(data.story_bible?.characters) &&
        hasArrayField(data.story_bible?.relationships) &&
        hasArrayField(data.story_bible?.key_events),
      message:
        "story_bible 必须包含 characters、relationships、key_events 数组。",
    },
    {
      rule: "R4",
      field: "script.scenes",
      passed: scenes.length >= 1,
      message: "script.scenes 至少包含 1 个场景。",
    },
    {
      rule: "R5",
      field: "script.scenes[]",
      passed: scenes.length > 0 && scenes.every(hasSceneRequiredFields),
      message:
        "每个场景必须包含 id、title、summary、characters、shots、dialogues、actions、source_refs。",
    },
    {
      rule: "R6",
      field: "script.scenes[].shots",
      passed: scenes.every((scene) =>
        (Array.isArray(scene.shots) ? scene.shots : []).every(
          hasShotPreviewFields,
        ),
      ),
      message:
        "shots 只校验基础预览字段，至少需要包含 id 和 visual，不校验视频生成参数。",
    },
    {
      rule: "R7",
      field: "metadata.validation_status",
      passed: Boolean(data.metadata?.validation_status),
      message: "metadata.validation_status 必须存在。",
    },
    {
      rule: "R8",
      field: "source_refs",
      passed:
        sceneAndEventRefs.length > 0 && sceneAndEventRefs.every(hasSourceRefs),
      message:
        "关键事件和场景必须带 source_refs，用来说明内容来自哪些章节。",
    },
  ];
}
