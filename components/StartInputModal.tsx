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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101820]/45 px-5 py-8">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-auto border border-[#d9e1e8] bg-white p-6 shadow-xl">
        <div className="flex flex-col gap-4 border-b border-[#dde3e8] pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#315f8a]">
              开始改编
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#101820]">
              先放入小说文本
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#59636e]">
              支持粘贴小说内容，也可以拖拽或选择 .txt 文件导入。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-fit border border-[#c8d3dc] bg-white px-4 py-2 text-sm font-semibold text-[#394552] transition-colors hover:bg-[#f1f5f8]"
          >
            关闭
          </button>
        </div>

        <label
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="mt-5 block cursor-pointer border border-dashed border-[#9fb4c5] bg-[#f7fafc] p-5 text-center transition-colors hover:bg-[#eef5f8]"
        >
          <span className="block text-sm font-semibold text-[#101820]">
            拖拽 .txt 文件到这里
          </span>
          <span className="mt-2 block text-sm text-[#59636e]">
            或点击选择文件，文件内容会自动填入下方文本框。
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
          <p className="mt-3 border border-[#c8d3dc] bg-[#fbfcfd] px-3 py-2 text-sm text-[#394552]">
            {fileMessage}
          </p>
        ) : null}

        <label className="mt-5 block text-sm font-semibold text-[#101820]">
          小说文本
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 min-h-64 w-full resize-y border border-[#c8d3dc] bg-white p-3 text-sm leading-6 text-[#101820] outline-none focus:border-[#315f8a]"
            placeholder="请粘贴至少 3 章小说文本..."
          />
        </label>

        {errorMessage ? (
          <p className="mt-3 border border-[#d59b9b] bg-[#fff4f4] px-3 py-2 text-sm text-[#9b2f2f]">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onUseSample}
            className="border border-[#c8d3dc] bg-white px-4 py-2 text-sm font-semibold text-[#394552] transition-colors hover:bg-[#f1f5f8]"
          >
            使用示例文本
          </button>
          <button
            type="button"
            onClick={onGenerate}
            className="border border-[#101820] bg-[#101820] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#24313d]"
          >
            生成 YAML
          </button>
        </div>
      </section>
    </div>
  );
}
