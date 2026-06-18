import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalArticles },
    { count: publishedArticles },
    { count: totalUsers },
    { count: totalComments },
    { data: recentArticles },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("published", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase
      .from("articles")
      .select("id, title, slug, published, created_at, profiles(username)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { label: "Total Articles", value: totalArticles ?? 0, sub: `${publishedArticles ?? 0} published`, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { label: "Total Users", value: totalUsers ?? 0, sub: "registered members", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { label: "Total Comments", value: totalComments ?? 0, sub: "across all articles", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { label: "Draft Articles", value: (totalArticles ?? 0) - (publishedArticles ?? 0), sub: "waiting to publish", color: "bg-rose-50 text-rose-700 border-rose-200" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform performance at a glance</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-white border rounded-xl p-5 ${stat.color.split(" ")[2]}`}>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent articles */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Articles</h2>
          <Link href="/admin/articles" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </Link>
        </div>
        {!recentArticles || recentArticles.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No articles yet.{" "}
            <Link href="/admin/articles/new" className="text-indigo-600 hover:underline">
              Create your first one
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Author</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                    {article.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(article.profiles as { username: string } | null)?.username ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      article.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {article.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{formatDate(article.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/articles/${article.id}/edit`}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
