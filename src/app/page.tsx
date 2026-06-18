import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { Article, Profile } from "@/types";

// 🚀 MASTER STROKE: Yeh line Next.js ko static cache use karne se roki gi aur har baar fresh database query chalayegi
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Al Huda Review — Articles",
};

export default async function HomePage() {
  const supabase = await createClient();

  // Sabse clear query: Jo bhi data hai directly khinch lo
  const { data: articles, error } = await supabase
    .from("articles")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, identity_status, batch_year, role, created_at")
      .eq("id", user.id)
      .maybeSingle(); 
    profile = data as Profile | null;
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Header user={user} profile={profile} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Latest Articles</h1>
          <p className="mt-2 text-gray-500 text-lg">Constructive Critique and Perspectives on Reformation</p>
        </div>

        {!articles || articles.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">No articles published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article as Article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}