import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { DeleteArticleButton } from "./articles/DeleteArticleButton";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Dashboard ke liye articles fetch karna
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, published, created_at, profiles(username)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your articles and users</p>
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

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {!articles || articles.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-sm">No articles available.</p>
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
              {articles.map((article) => {
                // Line 95 fix: Array aur Single object dono ke liye safe checking logic
                const authorName = Array.isArray(article.profiles)
                  ? article.profiles[0]?.username
                  : (article.profiles as any)?.username;

                return (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                      {article.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {authorName ?? "—"}
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        {article.published && (
                          <Link
                            href={`/articles/${article.slug}`}
                            target="_blank"
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            View
                          </Link>
                        )}
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Edit
                        </Link>
                        <DeleteArticleButton articleId={article.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
