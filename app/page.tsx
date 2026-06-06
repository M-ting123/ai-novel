import { mockYamlText } from "@/lib/mock-data";

export default function Home() {
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

        <pre className="max-h-[70vh] overflow-auto border border-[#d8cbb8] bg-[#fffaf2] p-5 text-sm leading-6 text-[#24211d] shadow-sm">
          <code>{mockYamlText}</code>
        </pre>
      </section>
    </main>
  );
}
