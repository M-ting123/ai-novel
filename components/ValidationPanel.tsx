import type { ValidationResult } from "@/lib/validate-schema";

type ValidationPanelProps = {
  results: readonly ValidationResult[];
};

export function ValidationPanel({ results }: ValidationPanelProps) {
  const passedCount = results.filter((result) => result.passed).length;
  const failedResults = results.filter((result) => !result.passed);

  return (
    <section className="border border-[#d8cbb8] bg-[#fffaf2] p-5">
      <div className="border-b border-[#d8cbb8] pb-4">
        <h2 className="text-2xl font-semibold text-[#24211d]">
          Schema 校验结果
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#5f584f]">
          通过 {passedCount} 条 / 失败 {failedResults.length} 条
        </p>
      </div>

      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {results.map((result) => (
          <li
            key={result.rule}
            className="border border-[#d8cbb8] bg-white p-3 text-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-[#24211d]">
                {result.rule} / {result.field}
              </p>
              <span
                className={
                  result.passed
                    ? "border border-[#7c9b5f] px-2 py-1 text-xs font-semibold text-[#4d6b35]"
                    : "border border-[#b66a5c] px-2 py-1 text-xs font-semibold text-[#8a3328]"
                }
              >
                {result.passed ? "通过" : "失败"}
              </span>
            </div>
            <p className="mt-2 leading-6 text-[#5f584f]">{result.message}</p>
          </li>
        ))}
      </ul>

      {failedResults.length > 0 ? (
        <div className="mt-4 border border-[#b66a5c] bg-[#fff8f5] p-3">
          <p className="text-sm font-semibold text-[#8a3328]">失败项</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-[#5f584f]">
            {failedResults.map((result) => (
              <li key={`failed-${result.rule}`}>
                {result.rule}：{result.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
