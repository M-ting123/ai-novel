export type ShotPreview = {
  id?: string;
  visual?: string;
  camera?: string;
  action_summary?: string;
  dialogue_summary?: string;
};

type ShotCardProps = {
  shot: ShotPreview;
};

export function ShotCard({ shot }: ShotCardProps) {
  return (
    <article className="border border-[#d8cbb8] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a4f2a]">
        {shot.id ?? "SHOT"}
      </p>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-semibold text-[#24211d]">画面描述</dt>
          <dd className="mt-1 leading-6 text-[#5f584f]">
            {shot.visual ?? "暂无画面描述"}
          </dd>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-[#24211d]">镜头提示</dt>
            <dd className="mt-1 text-[#5f584f]">{shot.camera ?? "未标注"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#24211d]">动作摘要</dt>
            <dd className="mt-1 text-[#5f584f]">
              {shot.action_summary ?? "未标注"}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[#24211d]">对白摘要</dt>
            <dd className="mt-1 text-[#5f584f]">
              {shot.dialogue_summary ?? "未标注"}
            </dd>
          </div>
        </div>
      </dl>
    </article>
  );
}
