const CONTENT_TYPE_LABELS: Record<string, string> = {
  banner: "배너",
  room: "객실 사진",
  youtube: "유튜브 링크",
  testimonial: "이용 후기",
};

export function ContentBlockFields({
  defaultType = "room",
  defaultTitle = "",
  defaultMediaUrl = "",
  defaultIsActive = true,
}: {
  defaultType?: string;
  defaultTitle?: string;
  defaultMediaUrl?: string;
  defaultIsActive?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr_1fr_auto]">
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
        placeholder="제목 (예: 그레이 타일 마감 외관)"
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
  );
}
