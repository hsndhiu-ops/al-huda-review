"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CommentFormProps {
  articleId: string;
  parentId: string | null;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({ articleId, parentId, onCancel, placeholder }: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to comment.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      parent_id: parentId,
      user_id: user.id,
      content: content.trim(),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setContent("");
    setLoading(false);
    if (onCancel) onCancel();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={parentId ? 3 : 4}
        placeholder={placeholder ?? "Share your thoughts…"}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          {loading ? "Posting…" : parentId ? "Post reply" : "Post comment"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
