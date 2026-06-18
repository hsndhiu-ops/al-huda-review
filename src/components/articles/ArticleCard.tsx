import Link from "next/link";
import type { Article } from "@/types";
import { formatDate, truncate } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const summary = article.summary || truncate(article.content, 160);

  return (
    <article className="bg-white border border-gray-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Article
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(article.created_at)}
            </span>
          </div>

          <Link href={`/articles/${article.slug}`}>
            <h2 className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
              {article.title}
            </h2>
          </Link>

          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{summary}</p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700">
                {(article.profiles?.username ?? "A").charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {article.profiles?.username ?? "Anonymous"}
              </span>
            </div>

            <Link
              href={`/articles/${article.slug}`}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Read article →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
