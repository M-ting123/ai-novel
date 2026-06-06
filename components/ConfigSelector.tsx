export type Genre = "悬疑" | "都市" | "玄幻" | "言情" | "通用";
export type Strategy = "忠实改编" | "压缩改编" | "冲突强化";

type ConfigSelectorProps = {
  genre: Genre;
  strategy: Strategy;
  onGenreChange: (genre: Genre) => void;
  onStrategyChange: (strategy: Strategy) => void;
};

const genres: readonly Genre[] = ["悬疑", "都市", "玄幻", "言情", "通用"];
const strategies: readonly Strategy[] = ["忠实改编", "压缩改编", "冲突强化"];

export function ConfigSelector({
  genre,
  strategy,
  onGenreChange,
  onStrategyChange,
}: ConfigSelectorProps) {
  return (
    <section className="border border-[#d8cbb8] bg-[#fffaf2] p-5">
      <div className="border-b border-[#d8cbb8] pb-4">
        <h2 className="text-2xl font-semibold text-[#24211d]">改编配置</h2>
        <p className="mt-2 text-sm leading-6 text-[#5f584f]">
          PR6 只保存配置选择并继续返回 Mock 结果，真实 AI 生成留到 PR7。
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-[#24211d]">
          题材类型
          <select
            value={genre}
            onChange={(event) => onGenreChange(event.target.value as Genre)}
            className="mt-2 w-full border border-[#d8cbb8] bg-white px-3 py-2 text-sm text-[#24211d] outline-none focus:border-[#8c6a3f]"
          >
            {genres.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-[#24211d]">
          改编策略
          <select
            value={strategy}
            onChange={(event) =>
              onStrategyChange(event.target.value as Strategy)
            }
            className="mt-2 w-full border border-[#d8cbb8] bg-white px-3 py-2 text-sm text-[#24211d] outline-none focus:border-[#8c6a3f]"
          >
            {strategies.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
