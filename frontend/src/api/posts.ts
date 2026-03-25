import { api } from '../services/api';
import type { CommunitySummary, Post } from '../types';

export const searchCommunities = async (query: string): Promise<CommunitySummary[]> => {
  const response = await api.get<{ communities: CommunitySummary[] }>(`/search/communities?q=${encodeURIComponent(query)}`);
  return response.data.communities;
};

export const searchPosts = async (query: string): Promise<Post[]> => {
  const response = await api.get<{ posts: Post[] }>(`/search/posts?q=${encodeURIComponent(query)}`);
  return response.data.posts;
};
