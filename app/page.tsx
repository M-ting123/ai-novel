"use client";

import { useState } from "react";
import {
  ConfigSelector,
  type Genre,
  type Strategy,
} from "@/components/ConfigSelector";
import { NovelInput } from "@/components/NovelInput";
import { SceneCard } from "@/components/SceneCard";
import { ShotCard } from "@/components/ShotCard";
import { ValidationPanel } from "@/components/ValidationPanel";
import { mockScriptData, mockYamlText, sampleNovelText } from "@/lib/mock-data";
import { validateSchema } from "@/lib/validate-schema";

type ParseStatus = "idle" | "success" | "failed";

export default function Home() {
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
  const [useMock, setUseMock] = useState(true);
  const characterNames = Object.fromEntries(
    mockScriptData.story_bible.characters.map((character) => [
      character.id,
      character.name,
    ]),
  );
  const validationResults = validateSchema(validationData);
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
    return (text.match(/第.+?章/g) ?? []).length;
  }

  function handleUseSample() {
    setNovelText(sampleNovelText);
    setInputError("");
    setStatusMessage("已填入示例文本。");
  }

  async function handleGenerate() {
    if (!novelText.trim()) {
      setInputError("请输入小说文本，或点击“使用示例文本”。");
      setStatusMessage("");
      setParseStatus("idle");
      setHasGenerated(false);
      return;
    }

    if (countChapters(novelText) < 3) {
      setInputError("章节不足：请至少输入 3 章内容。");
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
          novelText,
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

  return (
    <main className="min-h-screen bg-[#f7f3ec] px-5 py-8 text-[#24211d] sm:px-8 lg:px-12">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="border-b border-[#d8cbb8] pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#7a4f2a]">
            Novel2Script YAML Studio
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Mock Script YAML
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[#5f584f]">
            PR1 先展示一份符合第一版 Schema 契约的本地 Mock YAML
            结果。后续 PR 会按顺序加入复制、下载、预览、校验、输入和 AI
            生成能力。
          </p>
        </div>

        <NovelInput
          value={novelText}
          onChange={setNovelText}
          onUseSample={handleUseSample}
          errorMessage={inputError}
        />

        <ConfigSelector
          genre={genre}
          strategy={strategy}
          onGenreChange={setGenre}
          onStrategyChange={setStrategy}
        />

        <div className="flex flex-col gap-3 border border-[#d8cbb8] bg-[#fffaf2] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm leading-6 text-[#5f584f]">
              点击生成后调用 API Route；未配置 API key、网络失败或长时间无响应时会自动降级为 Mock YAML。
            </p>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#24211d]">
              <input
                type="checkbox"
                checked={useMock}
                onChange={(event) => setUseMock(event.target.checked)}
              />
              使用 Mock 示例
            </label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="border border-[#8c6a3f] bg-[#7a4f2a] px-4 py-2 text-sm font-semibold text-[#fffaf2] transition-colors hover:bg-[#8b5b33]"
            >
              {isGenerating ? "生成中..." : "生成 YAML"}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!hasGenerated}
              className="border border-[#8c6a3f] bg-[#24211d] px-4 py-2 text-sm font-semibold text-[#fffaf2] transition-colors hover:bg-[#3a332b]"
            >
              复制 YAML
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!hasGenerated}
              className="border border-[#8c6a3f] bg-[#fffaf2] px-4 py-2 text-sm font-semibold text-[#24211d] transition-colors hover:bg-[#efe2cf]"
            >
              下载 YAML
            </button>
          </div>
        </div>

        {statusMessage || parseStatus !== "idle" ? (
          <p className={`border px-4 py-3 text-sm ${statusClassName}`}>
            {statusMessage ? (
              <span className="block font-semibold">{statusMessage}</span>
            ) : null}
            {parseStatusMessage ? (
              <span className={statusMessage ? "mt-1 block" : "block"}>
                {parseStatusMessage}
              </span>
            ) : null}
          </p>
        ) : null}

        {hasGenerated ? (
          <ValidationPanel
            results={validationResults}
            source={validationSource}
          />
        ) : null}

        {hasGenerated ? (
          <>
            <section className="space-y-4">
              <div className="border-b border-[#d8cbb8] pb-3">
                <h2 className="text-2xl font-semibold text-[#24211d]">
                  剧本场景预览
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5f584f]">
                  当前展示剧本场景、人物、对白和动作；真实 AI 场景数据接入会在后续 PR 完成。
                </p>
              </div>
              <div className="space-y-5">
                {mockScriptData.script.scenes.map((scene) => (
                  <SceneCard
                    key={scene.id}
                    scene={scene}
                    characterNames={characterNames}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="border-b border-[#d8cbb8] pb-3">
                <h2 className="text-2xl font-semibold text-[#24211d]">
                  分镜预览
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#5f584f]">
                  当前按场景分组展示基础分镜字段；真实 AI 分镜数据接入会在后续 PR 完成。
                </p>
              </div>
              <div className="space-y-5">
                {mockScriptData.script.scenes.map((scene) => (
                  <section
                    key={scene.id}
                    className="border border-[#d8cbb8] bg-[#fffaf2] p-5"
                  >
                    <h3 className="text-lg font-semibold text-[#24211d]">
                      {scene.title}
                    </h3>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      {scene.shots.map((shot) => (
                        <ShotCard key={shot.id} shot={shot} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>

            <pre className="max-h-[70vh] overflow-auto border border-[#d8cbb8] bg-[#fffaf2] p-5 text-sm leading-6 text-[#24211d] shadow-sm">
              <code>{yamlText}</code>
            </pre>
          </>
        ) : null}
      </section>
    </main>
  );
}
