"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Article } from "@/types";

interface ArticleEditorProps {
  mode: "create" | "edit";
  article?: Article;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function ArticleEditor({ mode, article }: ArticleEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [published, setPublished] = useState(article?.published ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !slug.trim()) {
      setError("Title, slug, and content are required.");
      return;
    }

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      summary: summary.trim() || null,
      content: content.trim(),
      published,
      author_id: user.id,
      updated_at: new Date().toISOString(),
    };

    let err;
    if (mode === "create") {
      const result = await supabase.from("articles").insert(payload);
      err = result.error;
    } else {
      const result = await supabase
        .from("articles")
        .update(payload)
        .eq("id", article!.id);
      err = result.error;
    }

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={handleTitleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Article title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slug *{" "}
            <span className="text-gray-400 font-normal">(URL: /articles/your-slug)</span>
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="article-slug"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Summary{" "}
            <span className="text-gray-400 font-normal">(shown in article listing)</span>
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="A brief summary of the article…"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
        <p className="text-xs text-gray-400 mb-3">Plain text or Markdown — the first {600} characters are shown as a preview to non-authenticated visitors.</p>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          placeholder="Write your article content here…"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${published ? "bg-indigo-600" : "bg-gray-300"}`} />
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${published ? "translate-x-5" : "translate-x-0"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {published ? "Published" : "Draft"}
            </p>
            <p className="text-xs text-gray-500">
              {published ? "Visible to everyone" : "Only visible to admins"}
            </p>
          </div>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          {loading ? "Saving…" : mode === "create" ? "Create article" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/articles")}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
