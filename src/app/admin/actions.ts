"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const CONTENT_TYPES = ["banner", "room", "youtube", "testimonial"] as const;
type ContentType = (typeof CONTENT_TYPES)[number];

function parseContentBlockForm(formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const mediaUrl = String(formData.get("media_url") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!title || !CONTENT_TYPES.includes(type as ContentType)) {
    return null;
  }

  return {
    type: type as ContentType,
    title,
    media_url: mediaUrl || null,
    is_active: isActive,
  };
}

export async function createContentBlock(formData: FormData) {
  const values = parseContentBlockForm(formData);
  if (!values) return;

  const supabase = await createClient();
  await supabase.from("content_blocks").insert(values);
  revalidatePath("/admin");
}

export async function updateContentBlock(id: string, formData: FormData) {
  const values = parseContentBlockForm(formData);
  if (!values) return;

  const supabase = await createClient();
  await supabase.from("content_blocks").update(values).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteContentBlock(id: string) {
  const supabase = await createClient();
  await supabase.from("content_blocks").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
