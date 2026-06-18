"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this article? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("articles").delete().eq("id", articleId);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm text-red-500 hover:text-red-700 transition-colors"
    >
      Delete
    </button>
  );
}
