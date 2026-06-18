"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Comment } from "@/types";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "./CommentForm";
import { createClient } from "@/lib/supabase/client";

interface CommentThreadProps {
  comment: Comment;
  articleId: string;
  currentUserId: string | null;
  depth: number;
}

export function CommentThread({ comment, articleId, currentUserId, depth }: CommentThreadProps) {
  const router = useRouter();
  const [showReply, setShowReply] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwn = currentUserId === comment.user_id;
  const canReply = !!currentUserId && depth < 4;
  const indentClass = depth > 0 ? "ml-8 pl-4 border-l-2 border-gray-100" : "";

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("comments").delete().eq("id", comment.id);
    router.refresh();
  }

  return (
    <div className={indentClass}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 shrink-0">
              {(comment.profiles?.username ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">
                {comment.profiles?.username ?? "Deleted user"}
              </span>
              <span className="text-xs text-gray-400 ml-2">{formatDate(comment.created_at)}</span>
            </div>
          </div>

          {isOwn && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>

        {canReply && (
          <div className="mt-3">
            {showReply ? null : (
              <button
                onClick={() => setShowReply(true)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Reply
              </button>
            )}
          </div>
        )}

        {showReply && (
          <div className="mt-4">
            <CommentForm
              articleId={articleId}
              parentId={comment.id}
              onCancel={() => setShowReply(false)}
              placeholder={`Reply to ${comment.profiles?.username ?? "user"}…`}
            />
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              articleId={articleId}
              currentUserId={currentUserId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
