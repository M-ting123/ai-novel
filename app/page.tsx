"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Genre, Strategy } from "@/components/ConfigSelector";
import { SceneCard, type ScenePreview } from "@/components/SceneCard";
import { ShotCard, type ShotPreview } from "@/components/ShotCard";
import {
  StoryBiblePanel,
  type StoryBiblePreview,
} from "@/components/StoryBiblePanel";
import { StartInputModal } from "@/components/StartInputModal";
import { mockScriptData, mockYamlText, sampleNovelText } from "@/lib/mock-data";
import { validateSchema } from "@/lib/validate-schema";

type ParseStatus = "idle" | "success" | "failed";

type PreviewData = {
  characterNames: Record<string, string>;
  scenes: PreviewScene[];
};

type PreviewScene = ScenePreview & {
  shots?: ShotPreview[];
};

type FeatureSlide = {
  title: string;
  description: string;
  illustrationSrc: string;
};

type ToolDefinition = {
  id: "shots" | "scenes" | "assets";
  title: string;
  description: string;
};

type ToolTask = {
  id: string;
  toolId: ToolDefinition["id"];
  title: string;
  status: "generating" | "done";
  createdAt: string;
};

type StatusDetailType = "generation" | "validation" | "parse";

const featureSlides: FeatureSlide[] = [
  {
    title: "小说章节进入改编",
    description: "长篇、短篇、网文和故事草稿，都可以作为剧本改编输入。",
    illustrationSrc: "/illustrations/1.png",
  },
  {
    title: "剧本 YAML 生成",
    description: "把小说内容拆解为结构化 YAML，方便继续编辑、校验和复用。",
    illustrationSrc: "/illustrations/2.png",
  },
  {
    title: "故事资产拆解",
    description: "整理人物、关系、世界观和关键事件，让剧情资产更清楚。",
    illustrationSrc: "/illustrations/3.png",
  },
  {
    title: "Schema 校验",
    description: "检查字段缺失和结构问题，减少生成结果无法继续使用的风险。",
    illustrationSrc: "/illustrations/4.png",
  },
  {
    title: "复制与下载",
    description: "生成结果可以复制或下载，方便交给后续创作、剪辑或展示流程。",
    illustrationSrc: "/illustrations/5.png",
  },
];

const scriptTools: ToolDefinition[] = [
  {
    id: "shots",
    title: "场景分镜预览",
    description: "按场景查看镜头安排。",
  },
  {
    id: "scenes",
    title: "剧本场景预览",
    description: "查看场景、动作和对白。",
  },
  {
    id: "assets",
    title: "故事资源拆解",
    description: "整理人物、关系和世界观。",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getFirstString(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = getString(record[key]);

    if (value) {
      return value;
    }
  }

  return undefined;
}

function extractPreviewData(data: unknown): PreviewData {
  if (!isRecord(data)) {
    return { characterNames: {}, scenes: [] };
  }

  const storyBible = isRecord(data.story_bible) ? data.story_bible : {};
  const characterNames = Object.fromEntries(
    getArray(storyBible.characters)
      .filter(isRecord)
      .map((character) => [
        getString(character.id) ?? "",
        getString(character.name) ?? getString(character.id) ?? "",
      ])
      .filter(([id, name]) => id && name),
  );

  const script = isRecord(data.script) ? data.script : {};
  const scenes = getArray(script.scenes)
    .filter(isRecord)
    .map((scene): PreviewScene => ({
      id: getString(scene.id),
      title: getString(scene.title),
      location: getString(scene.location),
      time: getString(scene.time),
      summary: getString(scene.summary),
      characters: getArray(scene.characters).filter(
        (character): character is string => typeof character === "string",
      ),
      dialogues: getArray(scene.dialogues)
        .filter(isRecord)
        .map((dialogue) => ({
          character: getString(dialogue.character),
          text: getString(dialogue.text),
          tone: getString(dialogue.tone),
        })),
      actions: getArray(scene.actions)
        .filter(isRecord)
        .map((action) => ({
          character: getString(action.character),
          text: getString(action.text),
        })),
      shots: getArray(scene.shots)
        .filter(isRecord)
        .map((shot) => ({
          id: getString(shot.id),
          visual: getString(shot.visual),
          camera: getString(shot.camera),
          action_summary: getString(shot.action_summary),
          dialogue_summary: getString(shot.dialogue_summary),
        })),
    }));

  return { characterNames, scenes };
}

function extractStoryBible(data: unknown): StoryBiblePreview {
  if (!isRecord(data)) {
    return {
      characters: [],
      relationships: [],
      worldbuilding: { rules: [], locations: [] },
      keyEvents: [],
    };
  }

  const storyBible = isRecord(data.story_bible) ? data.story_bible : {};
  const worldbuilding = isRecord(storyBible.worldbuilding)
    ? storyBible.worldbuilding
    : {};
  const characterNameMap = Object.fromEntries(
    getArray(storyBible.characters)
      .filter(isRecord)
      .map((character) => [
        getString(character.id) ?? "",
        getString(character.name) ?? getString(character.id) ?? "",
      ])
      .filter(([id, name]) => id && name),
  );
  const getCharacterLabel = (characterId: string | undefined) =>
    characterId ? characterNameMap[characterId] ?? characterId : undefined;

  return {
    characters: getArray(storyBible.characters)
      .filter(isRecord)
      .map((character) => ({
        id: getString(character.id),
        name: getString(character.name),
        role: getString(character.role),
        personality: getFirstString(character, [
          "personality",
          "traits",
          "character",
          "性格",
        ]),
        goal: getFirstString(character, [
          "goal",
          "motivation",
          "objective",
          "目标",
        ]),
      })),
    relationships: getArray(storyBible.relationships)
      .filter(isRecord)
      .map((relationship) => ({
        from: getCharacterLabel(getString(relationship.from)),
        to: getCharacterLabel(getString(relationship.to)),
        type: getFirstString(relationship, ["type", "relation", "关系"]),
        description: getFirstString(relationship, [
          "description",
          "summary",
          "说明",
        ]),
      })),
    worldbuilding: {
      setting: getFirstString(worldbuilding, [
        "setting",
        "background",
        "world",
        "背景",
      ]),
      rules: [
        ...getArray(worldbuilding.rules),
        ...getArray(worldbuilding.mechanics),
      ].filter((rule): rule is string => typeof rule === "string"),
      locations: [
        ...getArray(worldbuilding.locations),
        ...getArray(worldbuilding.places),
      ].filter((location): location is string => typeof location === "string"),
      tone: getFirstString(worldbuilding, ["tone", "mood", "style", "基调"]),
    },
    keyEvents: [...getArray(storyBible.key_events), ...getArray(storyBible.events)]
      .filter(isRecord)
      .map((event) => ({
        id: getString(event.id),
        summary: getFirstString(event, ["summary", "description", "event"]),
        characters: getArray(event.characters).filter(
          (character): character is string => typeof character === "string",
        ).map((character) => getCharacterLabel(character) ?? character),
      })),
  };
}

export default function Home() {
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [parseStatus, setParseStatus] = useState<ParseStatus>("idle");
  const [validationData, setValidationData] = useState<unknown>(mockScriptData);
  const [validationSource, setValidationSource] = useState("Mock 示例");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [novelText, setNovelText] = useState("");
  const [inputError, setInputError] = useState("");
  const [genre, setGenre] = useState<Genre>("通用");
  const [strategy, setStrategy] = useState<Strategy>("忠实改编");
  const [yamlText, setYamlText] = useState(mockYamlText);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const [toolTasks, setToolTasks] = useState<ToolTask[]>([]);
  const [selectedToolTask, setSelectedToolTask] = useState<ToolTask | null>(
    null,
  );
  const [selectedStatusDetail, setSelectedStatusDetail] =
    useState<StatusDetailType | null>(null);
  const validationResults = validateSchema(validationData);
  const previewData = extractPreviewData(validationData);
  const storyBible = extractStoryBible(validationData);
  useEffect(() => {
    if (showWorkspace) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveFeatureIndex((currentIndex) =>
        currentIndex === featureSlides.length - 1 ? 0 : currentIndex + 1,
      );
    }, 3000);

    return () => window.clearInterval(timer);
  }, [showWorkspace]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(yamlText);
      setStatusMessage("已复制 YAML 到剪贴板。");
    } catch {
      setStatusMessage("复制失败，请手动选择 YAML 文本复制。");
    }
  }

  function handleDownload() {
    try {
      const blob = new Blob([yamlText], {
        type: "text/yaml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "novel2script-mock.yaml";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatusMessage("已下载 YAML 文件。");
    } catch {
      setStatusMessage("下载失败，请稍后重试。");
    }
  }

  function countChapters(text: string) {
    const patterns = [
      /第\s*[一二三四五六七八九十百千万\d]+\s*[章节回]/g,
      /章节\s*[一二三四五六七八九十百千万\d]+/g,
      /chapter\s*\d+/gi,
      /(^|[\r\n。！？!?；;”"）)])\s*\d+[\.、]\s*/gm,
    ];

    return Math.max(
      ...patterns.map((pattern) => (text.match(pattern) ?? []).length),
    );
  }

  function handleUseSample() {
    setNovelText(sampleNovelText);
    setInputError("");
    setStatusMessage("已填入示例文本。");
  }

  async function handleGenerate(text = novelText) {
    if (!text.trim()) {
      setInputError("请输入小说文本，或点击“使用示例文本”。");
      setStatusMessage("");
      setParseStatus("idle");
      setHasGenerated(false);
      return;
    }

    if (countChapters(text) < 3) {
      setInputError(
        "章节不足：请至少输入 3 章，支持“第一章”“第1章”“Chapter 1”或“1.”等格式。",
      );
      setStatusMessage("");
      setParseStatus("idle");
      setHasGenerated(false);
      return;
    }

    setInputError("");
    setStatusMessage("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          novelText: text,
          genre,
          strategy,
          useMock,
        }),
      });
      const result = (await response.json()) as {
        yamlText?: string;
        parsedData?: unknown;
        parseStatus?: Exclude<ParseStatus, "idle">;
        usedMock?: boolean;
        message?: string;
      };
      const nextParseStatus = result.parseStatus ?? "failed";
      const nextValidationData =
        nextParseStatus === "success" ? result.parsedData : mockScriptData;

      setYamlText(result.yamlText ?? mockYamlText);
      setValidationData(nextValidationData ?? mockScriptData);
      setValidationSource(
        nextParseStatus === "success" && !result.usedMock
          ? "AI 生成结果"
          : "Mock 示例",
      );
      setParseStatus(nextParseStatus);
      setStatusMessage(
        result.message ??
          (result.usedMock ? "已返回 Mock YAML。" : "AI YAML 生成完成。"),
      );
      setHasGenerated(true);
    } catch {
      setYamlText(mockYamlText);
      setValidationData(mockScriptData);
      setValidationSource("Mock 示例");
      setParseStatus("failed");
      setStatusMessage("生成请求失败，已自动降级为 Mock 示例。");
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCreateToolTask(tool: ToolDefinition) {
    if (!hasGenerated) {
      return;
    }

    const taskId = `${tool.id}-${toolTasks.length + 1}`;
    const createdAt = `任务 ${toolTasks.length + 1}`;

    setToolTasks((currentTasks) => [
      {
        id: taskId,
        toolId: tool.id,
        title: tool.title,
        status: "generating",
        createdAt,
      },
      ...currentTasks,
    ]);

    window.setTimeout(() => {
      setToolTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? { ...task, status: "done" } : task,
        ),
      );
    }, 1200);
  }

  const activeFeature = featureSlides[activeFeatureIndex];
  const failedValidationCount = validationResults.filter(
    (result) => !result.passed,
  ).length;
  const validationLabel = !hasGenerated
    ? "等待校验"
    : failedValidationCount > 0
      ? "校验未通过"
      : "校验通过";
  const apiStatusLabel = isGenerating
    ? "生成中"
    : hasGenerated
      ? statusMessage || "生成完成"
      : "等待生成";
  const displayedYamlText = hasGenerated
    ? yamlText
    : isGenerating
      ? "正在生成 YAML，请稍候..."
      : "等待生成 YAML...";
  const generationStatus = isGenerating
    ? {
        title: "生成中",
        tone: "neutral",
        detail: "AI 正在生成 YAML，请等待结果返回。",
      }
    : hasGenerated
      ? {
          title: "生成完成",
          tone: "success",
          detail: statusMessage || "AI YAML 已生成完成。",
        }
      : {
          title: "等待生成",
          tone: "neutral",
          detail: "输入小说文本后点击生成 YAML。",
        };
  const validationStatus = !hasGenerated
    ? {
        title: "等待校验",
        tone: "neutral",
        detail: "生成 YAML 后会自动进行 Schema 校验。",
      }
    : failedValidationCount > 0
      ? {
          title: "校验未通过",
          tone: "error",
          detail: `当前校验：${validationSource}，通过 ${
            validationResults.length - failedValidationCount
          } 条，失败 ${failedValidationCount} 条。`,
        }
      : {
          title: "校验通过",
          tone: "success",
          detail: `当前校验：${validationSource}，通过 ${validationResults.length} 条，失败 0 条。`,
        };
  const parseStatusSummary =
    parseStatus === "success"
      ? {
          title: "解析成功",
          tone: "success",
          detail: "服务器已把文本结果转成后续功能可使用的数据。",
        }
      : parseStatus === "failed"
        ? {
            title: "解析失败",
            tone: "error",
            detail:
              "当前已显示 Mock 示例，后续功能暂不能使用这次 AI 结果。",
          }
        : {
            title: "等待解析",
            tone: "neutral",
            detail: "生成 YAML 后会自动解析结构化数据。",
          };
  const statusCards = [
    {
      id: "generation" as const,
      label: generationStatus.title,
      detail: generationStatus.detail,
      tone: generationStatus.tone,
    },
    {
      id: "validation" as const,
      label: validationStatus.title,
      detail: validationStatus.detail,
      tone: validationStatus.tone,
    },
    {
      id: "parse" as const,
      label: parseStatusSummary.title,
      detail: parseStatusSummary.detail,
      tone: parseStatusSummary.tone,
    },
  ];
  const renderToolTaskContent = (task: ToolTask) => {
    if (task.toolId === "shots") {
      return previewData.scenes.length > 0 ? (
        <div className="space-y-4">
          {previewData.scenes.map((scene, sceneIndex) => (
            <section
              key={scene.id ?? `modal-shot-scene-${sceneIndex}`}
              className="border border-[#dde3e8] bg-[#fbfcfd] p-4"
            >
              <h3 className="text-base font-semibold text-[#101820]">
                {scene.title ?? "未命名场景"}
              </h3>
              {(scene.shots ?? []).length > 0 ? (
                <div className="mt-3 space-y-3">
                  {(scene.shots ?? []).map((shot, shotIndex) => (
                    <ShotCard
                      key={shot.id ?? `modal-shot-${sceneIndex}-${shotIndex}`}
                      shot={shot}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[#59636e]">暂无分镜。</p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#59636e]">暂无可展示的分镜。</p>
      );
    }

    if (task.toolId === "scenes") {
      return previewData.scenes.length > 0 ? (
        <div className="space-y-4">
          {previewData.scenes.map((scene, index) => (
            <SceneCard
              key={scene.id ?? `modal-scene-${index}`}
              scene={scene}
              characterNames={previewData.characterNames}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#59636e]">暂无可展示的场景。</p>
      );
    }

    return <StoryBiblePanel storyBible={storyBible} />;
  };

  if (!showWorkspace) {
    return (
      <main className="min-h-screen bg-[#f6f7f8] px-5 py-8 text-[#1f2933] sm:px-8 lg:px-12">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col justify-center gap-8">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#315f8a]">
              Novel2Script YAML Studio
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#101820] sm:text-6xl">
              文入剧中
            </h1>
            <p className="mt-5 text-base leading-8 text-[#59636e] sm:text-lg">
              从章回到镜头，从文字到剧本，让小说在结构化剧本中重新开场。
            </p>
            <button
              type="button"
              onClick={() => {
                setInputError("");
                setShowStartModal(true);
              }}
              className="mt-8 border border-[#101820] bg-[#101820] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#24313d]"
            >
              开始
            </button>
          </header>

          <section className="grid gap-5 border border-[#dde3e8] bg-white p-5 shadow-sm md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-semibold text-[#315f8a]">功能预览</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#101820]">
                先看清楚这套工作台能做什么
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#59636e]">
                首页先展示核心能力，点击开始后进入现有 YAML 生成工作区。
              </p>
            </div>

            <div className="border border-[#dde3e8] bg-[#fbfcfd] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a8794]">
                    {String(activeFeatureIndex + 1).padStart(2, "0")} /{" "}
                    {String(featureSlides.length).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-[#101820]">
                    {activeFeature.title}
                  </h3>
                </div>
                <span className="border border-[#c8d3dc] px-3 py-1 text-xs font-semibold text-[#315f8a]">
                  自动轮播
                </span>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-[#59636e]">
                {activeFeature.description}
              </p>
              <div className="mt-5 flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-white">
                <Image
                  src={activeFeature.illustrationSrc}
                  alt={activeFeature.title}
                  width={1456}
                  height={1056}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {featureSlides.map((feature, index) => (
                  <button
                    key={feature.title}
                    type="button"
                    onClick={() => setActiveFeatureIndex(index)}
                    aria-label={`切换到${feature.title}`}
                    className={`h-2.5 w-8 border transition-colors ${
                      activeFeatureIndex === index
                        ? "border-[#315f8a] bg-[#315f8a]"
                        : "border-[#c8d3dc] bg-white hover:bg-[#e8eef3]"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>
          {showStartModal ? (
            <StartInputModal
              value={novelText}
              onChange={(value) => {
                setNovelText(value);
                setInputError("");
              }}
              onClose={() => {
                setInputError("");
                setShowStartModal(false);
              }}
              onGenerate={() => {
                if (!novelText.trim()) {
                  setInputError("请先输入小说文本，或上传 .txt 文件。");
                  return;
                }

                setInputError("");
                setShowStartModal(false);
                setShowWorkspace(true);
                void handleGenerate(novelText);
              }}
              onUseSample={handleUseSample}
              errorMessage={inputError}
            />
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7f8] text-[#1f2933]">
      <section className="mx-auto grid max-w-[1440px] gap-5 px-5 py-5 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)_390px]">
        <aside className="flex min-w-0 flex-col gap-4 border border-[#dde3e8] bg-white p-4">
          <button
            type="button"
            onClick={() => setShowWorkspace(false)}
            className="w-fit rounded-full border border-[#c8d3dc] bg-white px-4 py-2 text-sm font-semibold text-[#394552] transition-all hover:-translate-x-0.5 hover:bg-[#f1f5f8]"
          >
            ← 返回主页
          </button>

          <div className="border-b border-[#dde3e8] pb-4">
            <p className="text-sm font-semibold text-[#315f8a]">
              Novel2Script
            </p>
            <h1 className="mt-1 text-xl font-semibold text-[#101820]">
              YAML 生成工作台
            </h1>
          </div>

          <div className="space-y-3">
            {statusCards.map((status) => (
              <button
                key={status.id}
                type="button"
                onClick={() =>
                  setSelectedStatusDetail((current) =>
                    current === status.id ? null : status.id,
                  )
                }
                className={`w-full rounded-2xl border px-3 py-3 text-left text-sm transition-all hover:-translate-y-0.5 ${
                  status.tone === "success"
                    ? "border-[#b9dec0] bg-[#f3fbf0] text-[#2f6b35]"
                    : status.tone === "error"
                      ? "border-[#f0b8b0] bg-[#fff4f4] text-[#9b2f2f]"
                      : "border-[#dde3e8] bg-[#fbfcfd] text-[#394552]"
                }`}
              >
                <span className="block font-semibold">{status.label}</span>
                <span className="mt-1 block text-xs opacity-80">
                  点击查看详情
                </span>
              </button>
            ))}
          </div>

          {selectedStatusDetail ? (
            <div className="rounded-2xl border border-[#dde3e8] bg-[#fbfcfd] p-3 text-sm leading-6 text-[#394552]">
              {
                statusCards.find((status) => status.id === selectedStatusDetail)
                  ?.detail
              }
            </div>
          ) : null}
        </aside>

        <div className="min-w-0">
          <section className="flex min-w-0 flex-col gap-4">
            <div className="border border-[#dde3e8] bg-white p-5">
              <div className="flex flex-col gap-3 border-b border-[#dde3e8] pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#101820]">
                    YAML 输出
                  </h2>
                  <p className="mt-1 text-sm text-[#59636e]">
                    生成结果会显示在这里，支持滚动查看完整结构。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="border border-[#c8d3dc] bg-[#fbfcfd] px-3 py-1 text-[#394552]">
                    API：{apiStatusLabel}
                  </span>
                  <span
                    className={`border px-3 py-1 ${
                      hasGenerated && failedValidationCount === 0
                        ? "border-[#8fb88f] bg-[#f3fbf0] text-[#2f6b35]"
                        : hasGenerated
                          ? "border-[#d59b9b] bg-[#fff4f4] text-[#9b2f2f]"
                          : "border-[#c8d3dc] bg-[#fbfcfd] text-[#394552]"
                    }`}
                  >
                    {validationLabel}
                  </span>
                </div>
              </div>

              <pre className="mt-4 max-h-[62vh] min-h-[52vh] overflow-auto border border-[#dde3e8] bg-[#fbfcfd] p-4 text-sm leading-6 text-[#101820]">
                <code>{displayedYamlText}</code>
              </pre>
            </div>

            <div className="border border-[#dde3e8] bg-white p-4">
              <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-[#394552]">
                    题材类型
                    <select
                      value={genre}
                      onChange={(event) =>
                        setGenre(event.target.value as Genre)
                      }
                      className="mt-2 w-full border border-[#c8d3dc] bg-white px-3 py-2 text-sm text-[#101820] outline-none focus:border-[#315f8a]"
                    >
                      {["悬疑", "都市", "玄幻", "言情", "通用"].map(
                        (option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-[#394552]">
                    改编策略
                    <select
                      value={strategy}
                      onChange={(event) =>
                        setStrategy(event.target.value as Strategy)
                      }
                      className="mt-2 w-full border border-[#c8d3dc] bg-white px-3 py-2 text-sm text-[#101820] outline-none focus:border-[#315f8a]"
                    >
                      {["忠实改编", "压缩改编", "冲突强化"].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      void handleGenerate();
                    }}
                    disabled={isGenerating}
                    className="border border-[#101820] bg-[#101820] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#24313d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating ? "生成中..." : "生成 YAML"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!hasGenerated}
                    className="border border-[#c8d3dc] bg-white px-4 py-2 text-sm font-semibold text-[#394552] transition-colors hover:bg-[#f1f5f8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    复制 YAML
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!hasGenerated}
                    className="border border-[#c8d3dc] bg-white px-4 py-2 text-sm font-semibold text-[#394552] transition-colors hover:bg-[#f1f5f8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    下载 YAML
                  </button>
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <label className="flex items-center gap-2 text-sm font-semibold text-[#394552]">
                  <input
                    type="checkbox"
                    checked={useMock}
                    onChange={(event) => setUseMock(event.target.checked)}
                  />
                  使用 Mock 示例
                </label>
              </div>
            </div>

            {inputError ? (
              <p className="border border-[#d59b9b] bg-[#fff4f4] px-4 py-3 text-sm text-[#9b2f2f]">
                {inputError}
              </p>
            ) : null}

          </section>
        </div>

          <aside className="flex min-w-0 flex-col gap-4">
            <section className="border border-[#dde3e8] bg-white p-4">
              <h2 className="text-lg font-semibold text-[#101820]">
                剧本工具箱
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {scriptTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleCreateToolTask(tool)}
                    disabled={!hasGenerated}
                    className="border border-[#dde3e8] bg-[#fbfcfd] p-3 text-left text-sm transition-colors hover:border-[#9fb4c5] hover:bg-[#f1f5f8] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <p className="font-semibold text-[#101820]">
                      {tool.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#59636e]">
                      {hasGenerated ? tool.description : "生成 YAML 后可使用。"}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className="border border-[#dde3e8] bg-white p-4">
              <h2 className="text-lg font-semibold text-[#101820]">
                生成结果
              </h2>
              {toolTasks.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {toolTasks.map((task) => (
                    <li
                      key={task.id}
                      className={`border text-sm ${
                        task.status === "done"
                          ? "border-[#c8d3dc] bg-white transition-colors hover:bg-[#f1f5f8]"
                          : "border-[#dde3e8] bg-[#f7fafc]"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={task.status !== "done"}
                        onClick={() => setSelectedToolTask(task)}
                        className="flex w-full items-center justify-between gap-3 p-3 text-left disabled:cursor-not-allowed"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                              task.status === "done"
                                ? "bg-[#3c8a4b]"
                                : "bg-[#9aa7b2]"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#101820]">
                              {task.title}
                            </p>
                            <p className="mt-1 text-xs text-[#59636e]">
                              {task.createdAt}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-xs font-semibold ${
                            task.status === "done"
                              ? "text-[#2f6b35]"
                              : "text-[#59636e]"
                          }`}
                        >
                          {task.status === "done" ? "已生成" : "生成中..."}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-[#59636e]">
                  点击上方工具卡片后，这里会显示生成任务记录。
                </p>
              )}
            </section>
          </aside>
      </section>

      {selectedToolTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101820]/45 px-5 py-8">
          <section className="max-h-[92vh] w-full max-w-4xl overflow-auto border border-[#dde3e8] bg-white p-5 shadow-xl">
            <div className="flex flex-col gap-3 border-b border-[#dde3e8] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#315f8a]">
                  已生成内容
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#101820]">
                  {selectedToolTask.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedToolTask(null)}
                className="w-fit border border-[#c8d3dc] bg-white px-4 py-2 text-sm font-semibold text-[#394552] transition-colors hover:bg-[#f1f5f8]"
              >
                关闭
              </button>
            </div>
            <div className="mt-5">{renderToolTaskContent(selectedToolTask)}</div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
