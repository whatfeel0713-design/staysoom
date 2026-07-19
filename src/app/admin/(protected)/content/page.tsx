import { createClient } from "@/utils/supabase/server";
import { createContentBlock, updateContentBlock, deleteContentBlock } from "../../actions";
import { ContentBlockFields } from "./content-block-fields";
import { DeleteButton } from "./delete-button";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const { data: blocks } = await supabase
    .from("content_blocks")
    .select("id, type, title, media_url, body, sort_order, is_active, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-lg font-semibold text-stone-900">새 콘텐츠 추가</h2>
        <form
          action={createContentBlock}
          className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <ContentBlockFields />
          <button
            type="submit"
            className="mt-4 rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
          >
            추가하기
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          전체 콘텐츠 ({blocks?.length ?? 0})
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          {blocks && blocks.length > 0 ? (
            blocks.map((block) => (
              <div
                key={block.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <form action={updateContentBlock.bind(null, block.id)}>
                  <ContentBlockFields
                    defaultType={block.type}
                    defaultTitle={block.title}
                    defaultMediaUrl={block.media_url ?? ""}
                    defaultBody={block.body ?? ""}
                    defaultSortOrder={block.sort_order ?? 0}
                    defaultIsActive={block.is_active}
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      type="submit"
                      className="rounded-full bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                    >
                      저장
                    </button>
                  </div>
                </form>
                <div className="mt-2 flex justify-end">
                  <DeleteButton action={deleteContentBlock.bind(null, block.id)} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center text-stone-500">
              아직 등록된 콘텐츠가 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
