type NovelInputProps = {
  value: string;
  onChange: (value: string) => void;
  onUseSample: () => void;
  errorMessage?: string;
};

export function NovelInput({
  value,
  onChange,
  onUseSample,
  errorMessage,
}: NovelInputProps) {
  return (
    <section className="border border-[#d8cbb8] bg-[#fffaf2] p-5">
      <div className="flex flex-col gap-3 border-b border-[#d8cbb8] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#24211d]">小说输入</h2>
          <p className="mt-2 text-sm leading-6 text-[#5f584f]">
            粘贴至少 3 章小说文本，或使用示例文本快速体验当前 Mock 生成流程。
          </p>
        </div>
        <button
          type="button"
          onClick={onUseSample}
          className="border border-[#8c6a3f] bg-white px-4 py-2 text-sm font-semibold text-[#24211d] transition-colors hover:bg-[#efe2cf]"
        >
          使用示例文本
        </button>
      </div>

      <label className="mt-4 block text-sm font-semibold text-[#24211d]">
        小说文本
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 min-h-56 w-full resize-y border border-[#d8cbb8] bg-white p-3 text-sm leading-6 text-[#24211d] outline-none focus:border-[#8c6a3f]"
          placeholder="请粘贴至少 3 章小说文本..."
        />
      </label>

      {errorMessage ? (
        <p className="mt-3 border border-[#b66a5c] bg-[#fff8f5] px-3 py-2 text-sm text-[#8a3328]">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
