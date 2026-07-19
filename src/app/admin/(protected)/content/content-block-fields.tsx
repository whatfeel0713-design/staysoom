const CONTENT_TYPE_LABELS: Record<string, string> = {
  banner: "메인 배너 (히어로 배경)",
  room: "공간 장면 (스테이 섹션)",
  youtube: "유튜브 링크",
  testimonial: "이용 후기",
};

export function ContentBlockFields({
  defaultType = "room",
  defaultTitle = "",
  defaultMediaUrl = "",
  defaultBody = "",
  defaultSortOrder = 0,
  defaultIsActive = true,
}: {
  defaultType?: string;
  defaultTitle?: string;
  defaultMediaUrl?: string;
  defaultBody?: string;
  defaultSortOrder?: number;
  defaultIsActive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[200px_1fr_1fr_auto]">
        <select
          name="type"
          defaultValue={defaultType}
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
        >
          {Object.entries(CONTENT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="title"
          required
          defaultValue={defaultTitle}
          placeholder="제목 (후기는 본문을 여기에)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
        />

        <input
          type="text"
          name="media_url"
          defaultValue={defaultMediaUrl}
          placeholder="이미지/유튜브 URL (선택)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
        />

        <label className="flex items-center gap-2 whitespace-nowrap px-1 text-sm text-stone-700">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={defaultIsActive}
            className="h-4 w-4 rounded border-stone-300"
          />
          공개
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
        <input
          type="text"
          name="body"
          defaultValue={defaultBody}
          placeholder="설명 문구 — 랜딩 카드에 함께 표시 (선택. 후기는 작성자 표기)"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
        />
        <input
          type="number"
          name="sort_order"
          defaultValue={defaultSortOrder}
          title="노출 순서 (낮을수록 먼저)"
          placeholder="순서"
          className="rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900"
        />
      </div>
    </div>
  );
}
