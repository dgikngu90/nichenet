export interface CommunitySummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  member_count: number;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  author_username: string;
  community_slug: string;
  upvotes: number;
  comment_count: number;
}

export interface User {
  id: string;
  username: string;
  name?: string;
  image?: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  _count?: {
    members: number;
    posts: number;
  };
}
