"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SceneCard, type ScenePreview } from "@/components/SceneCard";
import { ShotCard, type ShotPreview } from "@/components/ShotCard";
import {
  StoryBiblePanel,
  type StoryBiblePreview,
} from "@/components/StoryBiblePanel";
import { StartInputModal } from "@/components/StartInputModal";
import { ValidationPanel } from "@/components/ValidationPanel";
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
  const genre = "通用";
  const strategy = "忠实改编";
  const [yamlText, setYamlText] = useState(mockYamlText);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const validationResults = validateSchema(validationData);
  const previewData = extractPreviewData(validationData);
  const storyBible = extractStoryBible(validationData);
  const statusClassName =
    parseStatus === "success"
      ? "border-[#8fb88f] bg-[#f3fbf0] text-[#2f6b35]"
      : parseStatus === "failed"
        ? "border-[#d59b9b] bg-[#fff4f4] text-[#9b2f2f]"
        : "border-[#d8cbb8] bg-white text-[#5f584f]";
  const parseStatusMessage =
    parseStatus === "success"
      ? "YAML 结构解析成功：服务器已把文本结果转成后续功能可使用的数据。"
      : parseStatus === "failed"
        ? "YAML 结构解析失败：当前已显示 Mock 示例，后续功能暂不能使用这次 AI 结果。"
        : "";

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
      <section className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-5 sm:px-8">
        <header className="grid gap-4 border border-[#dde3e8] bg-white p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <button
            type="button"
            onClick={() => setShowWorkspace(false)}
            className="w-fit border border-[#c8d3dc] bg-white px-3 py-2 text-sm font-semibold text-[#394552] transition-colors hover:bg-[#f1f5f8]"
          >
            ← 返回
          </button>
          <div className="text-left sm:text-center">
            <p className="text-sm font-semibold text-[#315f8a]">
              Novel2Script YAML Studio
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[#101820]">
              YAML 生成工作台
            </h1>
          </div>
          <div className="hidden sm:block" aria-hidden="true" />
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
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
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

            {hasGenerated ? (
              <p className="border border-[#8fb88f] bg-[#f3fbf0] px-4 py-3 text-sm font-semibold text-[#2f6b35]">
                AI YAML 生成完成。
              </p>
            ) : null}

            {hasGenerated ? (
              <ValidationPanel
                results={validationResults}
                source={validationSource}
              />
            ) : null}

            {parseStatus !== "idle" ? (
              <p className={`border px-4 py-3 text-sm ${statusClassName}`}>
                {parseStatusMessage ? (
                  <span className="block">
                    {parseStatusMessage}
                  </span>
                ) : null}
              </p>
            ) : null}

            {inputError ? (
              <p className="border border-[#d59b9b] bg-[#fff4f4] px-4 py-3 text-sm text-[#9b2f2f]">
                {inputError}
              </p>
            ) : null}

          </section>

          <aside className="flex min-w-0 flex-col gap-4">
            <section className="border border-[#dde3e8] bg-white p-4">
              <h2 className="text-lg font-semibold text-[#101820]">
                剧本工具箱
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  "场景分镜预览",
                  "剧本场景预览",
                  "故事资源拆解",
                ].map((toolName) => (
                  <div
                    key={toolName}
                    className="border border-[#dde3e8] bg-[#fbfcfd] p-3 text-sm"
                  >
                    <p className="font-semibold text-[#101820]">{toolName}</p>
                    <p className="mt-1 text-xs leading-5 text-[#59636e]">
                      当前版本展示已生成结果，点击生成任务留到下一 PR。
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {hasGenerated ? (
              <>
                <section className="border border-[#dde3e8] bg-white p-4">
                  <h2 className="text-lg font-semibold text-[#101820]">
                    剧本场景预览
                  </h2>
                  <div className="mt-3 space-y-3">
                    {previewData.scenes.length > 0 ? (
                      previewData.scenes.map((scene, index) => (
                        <SceneCard
                          key={scene.id ?? `scene-${index}`}
                          scene={scene}
                          characterNames={previewData.characterNames}
                        />
                      ))
                    ) : (
                      <p className="border border-[#dde3e8] bg-[#fbfcfd] p-3 text-sm text-[#59636e]">
                        暂无可展示的场景。
                      </p>
                    )}
                  </div>
                </section>

                <section className="border border-[#dde3e8] bg-white p-4">
                  <h2 className="text-lg font-semibold text-[#101820]">
                    分镜预览
                  </h2>
                  <div className="mt-3 space-y-3">
                    {previewData.scenes.length > 0 ? (
                      previewData.scenes.map((scene, sceneIndex) => (
                        <section
                          key={scene.id ?? `shot-scene-${sceneIndex}`}
                          className="border border-[#dde3e8] bg-[#fbfcfd] p-3"
                        >
                          <h3 className="text-sm font-semibold text-[#101820]">
                            {scene.title ?? "未命名场景"}
                          </h3>
                          {(scene.shots ?? []).length > 0 ? (
                            <div className="mt-3 space-y-3">
                              {(scene.shots ?? []).map((shot, shotIndex) => (
                                <ShotCard
                                  key={
                                    shot.id ??
                                    `shot-${sceneIndex}-${shotIndex}`
                                  }
                                  shot={shot}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-[#59636e]">
                              暂无分镜。
                            </p>
                          )}
                        </section>
                      ))
                    ) : (
                      <p className="border border-[#dde3e8] bg-[#fbfcfd] p-3 text-sm text-[#59636e]">
                        暂无可展示的分镜。
                      </p>
                    )}
                  </div>
                </section>

                <StoryBiblePanel storyBible={storyBible} />
              </>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
