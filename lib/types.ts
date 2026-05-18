export interface Article {
  title: string; meta: string; keyword: string; category: string;
  content: string; image_path: string | null; source: string;
  created_at: string; slug: string; filename: string; wp_post_id?: number;
  imageUrl?: string | null;
}
