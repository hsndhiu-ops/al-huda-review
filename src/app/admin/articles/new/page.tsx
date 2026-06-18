import { ArticleEditor } from "@/components/admin/ArticleEditor";

export const metadata = { title: "New Article — Admin" };

export default function NewArticlePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">New Article</h1>
      <ArticleEditor mode="create" />
    </div>
  );
}
