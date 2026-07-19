import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "../actions";
import { AdminNav } from "./admin-nav";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4 sm:px-10">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-teal-700 uppercase">
            StaySoom
          </p>
          <h1 className="text-lg font-bold text-stone-900">관리자 대시보드</h1>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
          >
            로그아웃
          </button>
        </form>
      </header>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-10">{children}</main>
    </div>
  );
}
