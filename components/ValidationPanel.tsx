import type { ValidationResult } from "@/lib/validate-schema";

type ValidationPanelProps = {
  results: readonly ValidationResult[];
  source: string;
};

export function ValidationPanel({ results, source }: ValidationPanelProps) {
  const passedCount = results.filter((result) => result.passed).length;
  const failedResults = results.filter((result) => !result.passed);
  const hasFailures = failedResults.length > 0;

  return (
    <section
      className={`border px-4 py-3 text-sm ${
        hasFailures
          ? "border-[#d59b9b] bg-[#fff4f4] text-[#9b2f2f]"
          : "border-[#8fb88f] bg-[#f3fbf0] text-[#2f6b35]"
      }`}
    >
      <div>
        <h2 className="font-semibold">
          {hasFailures ? "Schema 校验未通过" : "Schema 校验通过"}
        </h2>
        <p className="mt-1 leading-6">
          当前校验：{source}。通过 {passedCount} 条 / 失败{" "}
          {failedResults.length} 条
        </p>
      </div>

      {failedResults.length > 0 ? (
        <div className="mt-2">
          <p className="leading-6">
            YAML 格式有问题，可能导致场景、分镜或校验结果不准确，建议重新生成一次。
          </p>
          <ul className="mt-1 space-y-1 leading-6">
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
