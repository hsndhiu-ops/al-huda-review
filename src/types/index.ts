export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  identity_status: string | null;
  batch_year: number | null;
  role: "user" | "admin";
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: string;
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
}

export interface Comment {
  id: string;
  article_id: string;
  parent_id: string | null;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: Profile | null;
  replies?: Comment[];
}
