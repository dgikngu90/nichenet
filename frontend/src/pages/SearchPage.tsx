import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { searchCommunities, searchPosts } from '../api/posts';
import type { CommunitySummary, Post } from '../types';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const [communitiesData, postsData] = await Promise.all([
        searchCommunities(searchQuery),
        searchPosts(searchQuery),
      ]);
      setCommunities(communitiesData);
      setPosts(postsData);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when query changes
  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  return (
    <Layout>
      <div className="search-page p-4">
        <h1 className="text-2xl font-bold mb-4">Search</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search communities and posts..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={query}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch((e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {communities.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Communities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communities.map((community) => (
                    <a
                      key={community.id}
                      href={`/c/${community.slug}`}
                      className="border rounded-lg p-4 hover:bg-gray-50"
                    >
                      <h3 className="font-medium">{community.name}</h3>
                      <p className="text-gray-600 text-sm">@{community.slug}</p>
                      {community.description && (
                        <p className="text-sm mt-2">{community.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {community.member_count} members
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {posts.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Posts</h2>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg">
                        <a href={`/p/${post.id}`} className="hover:underline">
                          {post.title}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600">
                        by u/{post.author_username} in c/{post.community_slug}
                      </p>
                      <p className="text-sm mt-2 line-clamp-3">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>{post.upvotes} upvotes</span>
                        <span>{post.comment_count} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!loading && query && communities.length === 0 && posts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No results found for "{query}"
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default SearchPage;
