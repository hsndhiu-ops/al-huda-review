import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import type { Article } from "@/types";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) notFound();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Article</h1>
      <ArticleEditor mode="edit" article={article as Article} />
    </div>
  );
}
