import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/Header";
import { CommentThread } from "@/components/comments/CommentThread";
import { CommentForm } from "@/components/comments/CommentForm";
import { formatDate, buildCommentTree } from "@/lib/utils";
import type { Comment, Profile } from "@/types";

const GATE_CHAR_LIMIT = 600;

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("title, summary")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Article Not Found" };
  return { title: data.title, description: data.summary };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: article }, { data: { user } }] = await Promise.all([
    supabase
      .from("articles")
      .select("*, profiles(id, username, full_name, role, created_at)")
      .eq("slug", slug)
      .eq("published", true)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (!article) notFound();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, identity_status, batch_year, role, created_at")
      .eq("id", user.id)
      .single();
    profile = data as Profile | null;
  }

  const isGated = !user && article.content.length > GATE_CHAR_LIMIT;
  const visibleContent = isGated ? article.content.slice(0, GATE_CHAR_LIMIT) : article.content;

  const { data: rawComments } = await supabase
    .from("comments")
    .select("*, profiles(id, username, full_name, role, created_at)")
    .eq("article_id", article.id)
    .order("created_at", { ascending: true });

  const commentTree = buildCommentTree((rawComments ?? []) as Comment[]);

  const authorName = article.profiles?.full_name ?? article.profiles?.username ?? "Anonymous";
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Header user={user} profile={profile} />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Article header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Articles
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-900 font-medium truncate max-w-xs">{article.title}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-xl text-gray-500 leading-relaxed mb-6">{article.summary}</p>
          )}

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-semibold text-indigo-700">
              {authorInitial}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{authorName}</p>
              <p className="text-xs text-gray-400">{formatDate(article.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12 relative overflow-hidden">
          <div
            className={`prose-article ${isGated ? "gate-fade max-h-64 overflow-hidden" : ""}`}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {visibleContent}
          </div>

          {isGated && (
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-end pb-8 pt-24 bg-gradient-to-t from-white via-white/95 to-transparent">
              <div className="text-center px-6 py-8 max-w-sm">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Continue reading</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Create a free account to read this article in full and join the discussion.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/auth/register" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                    Sign up for free
                  </Link>
                  <Link href={`/auth/login?next=/articles/${slug}`} className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {commentTree.length > 0
              ? `${(rawComments ?? []).length} Comment${(rawComments ?? []).length === 1 ? "" : "s"}`
              : "Discussion"}
          </h2>

          {user ? (
            <div className="mb-8">
              <CommentForm articleId={article.id} parentId={null} />
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8 text-center">
              <p className="text-sm text-gray-600 mb-3">
                <Link href="/auth/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
                {" or "}
                <Link href="/auth/register" className="text-indigo-600 font-medium hover:underline">create an account</Link>
                {" to join the discussion."}
              </p>
            </div>
          )}

          {commentTree.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No comments yet. Be the first to share your thoughts.
            </p>
          ) : (
            <div className="space-y-4">
              {commentTree.map((comment) => (
                <CommentThread
                  key={comment.id}
                  comment={comment}
                  articleId={article.id}
                  currentUserId={user?.id ?? null}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
