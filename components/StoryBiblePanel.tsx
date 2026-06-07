export type StoryBiblePreview = {
  characters: {
    id?: string;
    name?: string;
    role?: string;
    personality?: string;
    goal?: string;
  }[];
  relationships: {
    from?: string;
    to?: string;
    type?: string;
    description?: string;
  }[];
  worldbuilding: {
    setting?: string;
    rules: string[];
    locations: string[];
    tone?: string;
  };
  keyEvents: {
    id?: string;
    summary?: string;
    characters: string[];
  }[];
};

type StoryBiblePanelProps = {
  storyBible: StoryBiblePreview;
};

function EmptyText({ children }: { children: string }) {
  return <p className="text-sm text-[#5f6368]">{children}</p>;
}

export function StoryBiblePanel({ storyBible }: StoryBiblePanelProps) {
  const hasWorldbuilding =
    storyBible.worldbuilding.setting ||
    storyBible.worldbuilding.tone ||
    storyBible.worldbuilding.rules.length > 0 ||
    storyBible.worldbuilding.locations.length > 0;

  return (
    <section className="space-y-4">
      <div className="border-b border-[#e0e0e0] pb-3">
        <h2 className="text-2xl font-semibold text-[#1f1f1f]">故事资产拆解</h2>
        <p className="mt-2 text-sm leading-6 text-[#5f6368]">
          根据当前生成结果展示人物、关系、世界观和关键事件。
        </p>
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        <section className="rounded-2xl border border-[#e0e0e0] bg-[#f8f9fa] p-5">
          <h3 className="text-lg font-semibold text-[#1f1f1f]">人物</h3>
          {storyBible.characters.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {storyBible.characters.map((character, index) => (
                <li
                  key={character.id ?? `character-${index}`}
                  className="rounded-2xl border border-[#e0e0e0] bg-white p-3 text-sm shadow-sm"
                >
                  <p className="font-semibold text-[#1f1f1f]">
                    {character.name ?? character.id ?? "未命名人物"}
                    {character.role ? (
                      <span className="font-normal text-[#1a73e8]">
                        {" "}
                        / {character.role}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 leading-6 text-[#5f6368]">
                    性格：{character.personality ?? "未标注"}
                  </p>
                  <p className="mt-1 leading-6 text-[#5f6368]">
                    目标：{character.goal ?? "未标注"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <EmptyText>暂无人物拆解。</EmptyText>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#e0e0e0] bg-[#f8f9fa] p-5">
          <h3 className="text-lg font-semibold text-[#1f1f1f]">人物关系</h3>
          {storyBible.relationships.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {storyBible.relationships.map((relationship, index) => (
                <li
                  key={`${relationship.from ?? "from"}-${relationship.to ?? "to"}-${index}`}
                  className="rounded-2xl border border-[#e0e0e0] bg-white p-3 text-sm shadow-sm"
                >
                  <p className="font-semibold text-[#1f1f1f]">
                    {relationship.from ?? "未知人物"} 到{" "}
                    {relationship.to ?? "未知人物"}
                    {relationship.type ? (
                      <span className="font-normal text-[#1a73e8]">
                        {" "}
                        / {relationship.type}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 leading-6 text-[#5f6368]">
                    {relationship.description ?? "暂无关系说明"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <EmptyText>暂无人物关系。</EmptyText>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#e0e0e0] bg-[#f8f9fa] p-5">
          <h3 className="text-lg font-semibold text-[#1f1f1f]">世界观</h3>
          {hasWorldbuilding ? (
            <div className="mt-3 space-y-3 text-sm leading-6 text-[#5f6368]">
              <p>背景：{storyBible.worldbuilding.setting ?? "未标注"}</p>
              <p>基调：{storyBible.worldbuilding.tone ?? "未标注"}</p>
              <p>
                地点：
                {storyBible.worldbuilding.locations.length > 0
                  ? storyBible.worldbuilding.locations.join("、")
                  : "未标注"}
              </p>
              <p>
                规则：
                {storyBible.worldbuilding.rules.length > 0
                  ? storyBible.worldbuilding.rules.join("；")
                  : "未标注"}
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <EmptyText>暂无世界观信息。</EmptyText>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#e0e0e0] bg-[#f8f9fa] p-5">
          <h3 className="text-lg font-semibold text-[#1f1f1f]">关键事件</h3>
          {storyBible.keyEvents.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {storyBible.keyEvents.map((event, index) => (
                <li
                  key={event.id ?? `event-${index}`}
                  className="rounded-2xl border border-[#e0e0e0] bg-white p-3 text-sm shadow-sm"
                >
                  <p className="font-semibold text-[#1f1f1f]">
                    {event.id ?? `事件 ${index + 1}`}
                  </p>
                  <p className="mt-2 leading-6 text-[#5f6368]">
                    {event.summary ?? "暂无事件说明"}
                  </p>
                  <p className="mt-1 leading-6 text-[#5f6368]">
                    相关人物：
                    {event.characters.length > 0
                      ? event.characters.join("、")
                      : "未标注"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3">
              <EmptyText>暂无关键事件。</EmptyText>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
