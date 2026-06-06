"use client";

import { useState } from "react";
import { SceneCard } from "@/components/SceneCard";
import { ShotCard } from "@/components/ShotCard";
import { ValidationPanel } from "@/components/ValidationPanel";
import { mockScriptData, mockYamlText } from "@/lib/mock-data";
import { validateSchema } from "@/lib/validate-schema";

export default function Home() {
  const [statusMessage, setStatusMessage] = useState("");
  const characterNames = Object.fromEntries(
    mockScriptData.story_bible.characters.map((character) => [
      character.id,
      character.name,
    ]),
  );
  const validationResults = validateSchema(mockScriptData);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(mockYamlText);
      setStatusMessage("已复制 YAML 到剪贴板。");
    } catch {
      setStatusMessage("复制失败，请手动选择 YAML 文本复制。");
    }
  }

  function handleDownload() {
    try {
      const blob = new Blob([mockYamlText], {
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

        <div className="flex flex-col gap-3 border border-[#d8cbb8] bg-[#fffaf2] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[#5f584f]">
            当前展示的是 Mock YAML，可先复制或下载，后续 PR 再加入预览和校验。
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="border border-[#8c6a3f] bg-[#24211d] px-4 py-2 text-sm font-semibold text-[#fffaf2] transition-colors hover:bg-[#3a332b]"
            >
              复制 YAML
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="border border-[#8c6a3f] bg-[#fffaf2] px-4 py-2 text-sm font-semibold text-[#24211d] transition-colors hover:bg-[#efe2cf]"
            >
              下载 YAML
            </button>
          </div>
        </div>

        {statusMessage ? (
          <p className="border border-[#d8cbb8] bg-white px-4 py-3 text-sm text-[#5f584f]">
            {statusMessage}
          </p>
        ) : null}

        <ValidationPanel results={validationResults} />

        <section className="space-y-4">
          <div className="border-b border-[#d8cbb8] pb-3">
            <h2 className="text-2xl font-semibold text-[#24211d]">
              剧本场景预览
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#5f584f]">
              PR3 从 Mock TS object 读取 script.scenes，先展示场景、人物、对白和动作；分镜内容留到 PR4。
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
              PR4 从 Mock TS object 读取 script.scenes[].shots，按场景分组展示基础分镜；这里只展示第一版 Schema 定义的基础分镜字段。
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
          <code>{mockYamlText}</code>
        </pre>
      </section>
    </main>
  );
}
