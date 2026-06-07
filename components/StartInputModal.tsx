import { useState, type DragEvent } from "react";

type StartInputModalProps = {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onGenerate: () => void;
  onUseSample: () => void;
  errorMessage?: string;
};

export function StartInputModal({
  value,
  onChange,
  onClose,
  onGenerate,
  onUseSample,
  errorMessage,
}: StartInputModalProps) {
  const [fileMessage, setFileMessage] = useState("");
  const [showPasteArea, setShowPasteArea] = useState(Boolean(value.trim()));

  async function importTextFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".txt")) {
      setFileMessage("仅支持导入 .txt 文本文件。");
      return;
    }

    try {
      const text = await file.text();
      onChange(text);
      setShowPasteArea(true);
      setFileMessage(`已导入 ${file.name}`);
    } catch {
      setFileMessage("文件读取失败，请重新选择 .txt 文件。");
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void importTextFile(event.dataTransfer.files[0]);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 py-8">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-2xl border border-[#e0e0e0] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.15)]">
        <div className="text-center">
          <p className="text-sm font-semibold text-[#1a73e8]">添加来源</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">
            上传你的小说内容
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#5f6368]">
            拖拽 .txt 文件，或粘贴小说章节文本，然后直接生成剧本 YAML。
          </p>
        </div>

        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="mt-6 block cursor-pointer rounded-2xl border-2 border-dashed border-[#c4c7cc] bg-[#f8f9fa] p-8 text-center transition-colors hover:border-[#1a73e8] hover:bg-[#f3f7fe]"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d3e3fd] text-xl text-[#1a73e8]">
            ↑
          </span>
          <span className="mt-4 block text-base font-semibold text-[#1f1f1f]">
            拖拽 .txt 文件到这里
          </span>
          <span className="mt-2 block text-sm text-[#5f6368]">
            或点击选择文件，文件内容会自动填入文本区域。
          </span>
          <input
            type="file"
            accept=".txt,text/plain"
            className="sr-only"
            onChange={(event) => {
              void importTextFile(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </label>

        {fileMessage ? (
          <p className="mt-3 rounded-xl border border-[#e0e0e0] bg-[#f8f9fa] px-3 py-2 text-sm text-[#3c4043]">
            {fileMessage}
          </p>
        ) : null}

        <div className="mt-5 rounded-2xl border border-[#e0e0e0] bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#1f1f1f]">
                粘贴文本
              </h3>
              <p className="mt-1 text-sm text-[#5f6368]">
                如果没有 txt 文件，可以直接粘贴小说内容。
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasteArea((current) => !current)}
              className="w-fit rounded-full border border-[#dadce0] bg-white px-4 py-2 text-sm font-semibold text-[#3c4043] transition-colors hover:bg-[#f8f9fa]"
            >
              {showPasteArea ? "收起文本框" : "打开文本框"}
            </button>
          </div>

          {showPasteArea ? (
            <label className="mt-4 block text-sm font-semibold text-[#1f1f1f]">
              小说文本
              <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 min-h-56 w-full resize-y rounded-xl border border-[#dadce0] bg-white p-3 text-sm leading-6 text-[#1f1f1f] outline-none focus:border-[#1a73e8]"
                placeholder="请粘贴至少 3 章小说文本..."
              />
              <span className="mt-2 block text-xs font-normal text-[#5f6368]">
                当前字数：{value.length}
              </span>
            </label>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="mt-3 rounded-xl border border-[#f0b8b0] bg-[#fff4f4] px-3 py-2 text-sm text-[#9b2f2f]">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#dadce0] bg-white px-5 py-2 text-sm font-semibold text-[#3c4043] transition-colors hover:bg-[#f8f9fa]"
          >
            返回
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                onUseSample();
                setShowPasteArea(true);
              }}
              className="rounded-full border border-[#dadce0] bg-white px-5 py-2 text-sm font-semibold text-[#3c4043] transition-colors hover:bg-[#f8f9fa]"
            >
              使用示例文本
            </button>
            <button
              type="button"
              onClick={onGenerate}
              className="rounded-full bg-[#1a73e8] px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#1765cc] hover:shadow-md"
            >
              生成 YAML
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
