type SceneCardProps = {
  scene: {
    id: string;
    title: string;
    location: string;
    time?: string;
    summary: string;
    characters: readonly string[];
    dialogues: readonly {
      character: string;
      text: string;
      tone?: string;
    }[];
    actions: readonly {
      character?: string;
      text: string;
    }[];
  };
  characterNames: Readonly<Record<string, string>>;
};

function getCharacterName(
  characterId: string | undefined,
  characterNames: Readonly<Record<string, string>>,
) {
  if (!characterId) {
    return "环境";
  }

  return characterNames[characterId] ?? characterId;
}

export function SceneCard({ scene, characterNames }: SceneCardProps) {
  return (
    <article className="border border-[#d8cbb8] bg-[#fffaf2] p-5 shadow-sm">
      <div className="border-b border-[#d8cbb8] pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7a4f2a]">
          {scene.id}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#24211d]">
          {scene.title}
        </h2>
        <dl className="mt-4 grid gap-3 text-sm text-[#5f584f] sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-[#24211d]">地点</dt>
            <dd className="mt-1">{scene.location}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#24211d]">时间</dt>
            <dd className="mt-1">{scene.time ?? "未标注"}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 space-y-5">
        <section>
          <h3 className="text-sm font-semibold text-[#24211d]">场景摘要</h3>
          <p className="mt-2 text-sm leading-6 text-[#5f584f]">
            {scene.summary}
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#24211d]">出场人物</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {scene.characters.map((characterId) => (
              <li
                key={characterId}
                className="border border-[#d8cbb8] bg-white px-3 py-1 text-sm text-[#5f584f]"
              >
                {getCharacterName(characterId, characterNames)}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#24211d]">对白</h3>
          <ul className="mt-2 divide-y divide-[#d8cbb8] border border-[#d8cbb8] bg-white">
            {scene.dialogues.map((dialogue, index) => (
              <li key={`${dialogue.character}-${index}`} className="p-3">
                <p className="text-sm font-semibold text-[#24211d]">
                  {getCharacterName(dialogue.character, characterNames)}
                  {dialogue.tone ? (
                    <span className="font-normal text-[#7a4f2a]">
                      {" "}
                      / {dialogue.tone}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5f584f]">
                  {dialogue.text}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[#24211d]">动作</h3>
          <ul className="mt-2 space-y-2">
            {scene.actions.map((action, index) => (
              <li
                key={`${action.character ?? "environment"}-${index}`}
                className="border-l-2 border-[#8c6a3f] bg-white px-3 py-2 text-sm leading-6 text-[#5f584f]"
              >
                <span className="font-semibold text-[#24211d]">
                  {getCharacterName(action.character, characterNames)}：
                </span>
                {action.text}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
}
