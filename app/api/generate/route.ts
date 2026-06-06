import { load } from "js-yaml";
import { mockScriptData, mockYamlText } from "@/lib/mock-data";

const DEEPSEEK_CHAT_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-v4-flash";
const REQUEST_TIMEOUT_MS = 60000;

export const maxDuration = 60;

type GenerateRequestBody = {
  novelText?: string;
  genre?: string;
  strategy?: string;
  useMock?: boolean;
};

type ParseStatus = "success" | "failed";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseYamlText(yamlText: string): {
  parsedData: Record<string, unknown> | null;
  parseStatus: ParseStatus;
} {
  try {
    const parsedData = load(normalizeYamlText(yamlText));

    if (!isRecord(parsedData)) {
      return {
        parsedData: null,
        parseStatus: "failed",
      };
    }

    return {
      parsedData,
      parseStatus: "success",
    };
  } catch {
    return {
      parsedData: null,
      parseStatus: "failed",
    };
  }
}

function normalizeYamlText(yamlText: string) {
  return yamlText
    .trim()
    .replace(/^```(?:yaml|yml)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function buildPrompt({
  novelText,
  genre,
  strategy,
}: Required<Pick<GenerateRequestBody, "novelText" | "genre" | "strategy">>) {
  return `把以下小说文本改编为短剧剧本 YAML。只输出纯 YAML，不要 Markdown 代码块和额外解释。

YAML 结构要求：
- 顶层: project(含schema_version/title/created_at/language), source(含input_type/chapter_count/chapters), story_bible(含characters/relationships/worldbuilding/key_events), adaptation(含genre/strategy/output_mode), script(含scenes), metadata(含validation_status/warnings/source_refs)
- 每个scene: id/title/location/time/summary/characters/shots/dialogues/actions/source_refs
- 每个shot: id/visual/camera/action_summary/dialogue_summary
- source_refs 标记来源章节，不明确时写入 warnings 不编造

题材: ${genre}  策略: ${strategy}

小说文本:
${novelText}`;
}

function mockResponse(
  reason: string,
  status = 200,
  parseStatus: ParseStatus = "success",
) {
  const parsedMock = parseYamlText(mockYamlText);

  return Response.json(
    {
      yamlText: mockYamlText,
      parsedData: parsedMock.parsedData ?? mockScriptData,
      parseStatus:
        parseStatus === "failed" ? parseStatus : parsedMock.parseStatus,
      usedMock: true,
      message: reason,
    },
    { status },
  );
}

function extractTextFromResponse(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "choices" in payload &&
    Array.isArray(payload.choices)
  ) {
    const firstChoice = payload.choices[0] as
      | { message?: { content?: unknown } }
      | undefined;

    if (typeof firstChoice?.message?.content === "string") {
      return firstChoice.message.content;
    }
  }

  return "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as GenerateRequestBody;
  const novelText = body.novelText?.trim() ?? "";
  const genre = body.genre ?? "通用";
  const strategy = body.strategy ?? "忠实改编";

  if (body.useMock) {
    return mockResponse("当前使用 Mock 示例，未调用外部 AI API。");
  }

  if (!novelText) {
    return mockResponse("输入为空，已自动降级为 Mock 示例。", 400, "failed");
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return mockResponse(
      "未配置 DEEPSEEK_API_KEY，已自动降级为 Mock 示例。",
      200,
      "failed",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const model = process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;

  try {
    const response = await fetch(DEEPSEEK_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "你是一个严谨的小说改编剧本 YAML 生成助手，只输出纯 YAML。",
          },
          {
            role: "user",
            content: buildPrompt({ novelText, genre, strategy }),
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
        ...(model.startsWith("deepseek-v4")
          ? { thinking: { type: "disabled" } }
          : {}),
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return mockResponse(
        "AI API 调用失败，已自动降级为 Mock 示例。",
        200,
        "failed",
      );
    }

    const payload = (await response.json()) as unknown;
    const yamlText = extractTextFromResponse(payload).trim();

    if (!yamlText) {
      return mockResponse(
        "AI 没有返回可解析的 YAML 正文，已自动降级为 Mock 示例。",
        200,
        "failed",
      );
    }

    const parsedResult = parseYamlText(yamlText);

    if (parsedResult.parseStatus === "failed") {
      return mockResponse(
        "AI YAML 解析失败，已自动降级为 Mock 示例。",
        200,
        "failed",
      );
    }

    return Response.json({
      yamlText,
      parsedData: parsedResult.parsedData,
      parseStatus: parsedResult.parseStatus,
      usedMock: false,
      message: "AI YAML 生成完成。",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "AI API 60 秒无响应，已自动降级为 Mock 示例。"
        : "AI API 请求异常，已自动降级为 Mock 示例。";

    return mockResponse(message, 200, "failed");
  } finally {
    clearTimeout(timeout);
  }
}
