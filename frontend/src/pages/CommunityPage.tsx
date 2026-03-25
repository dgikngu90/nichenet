import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface CommunityDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  rules?: string;
  icon?: string;
  banner?: string;
  isPrivate: boolean;
  owner: { id: string; username: string; name?: string; image?: string };
  isMember: boolean;
  memberRole?: string;
  _count?: { members: number; posts: number };
  recentPosts: Array<{
    id: string;
    title: string;
    createdAt: string;
    author: { id: string; username: string; name?: string; image?: string };
    _count: { comments: number };
  }>;
}

const CommunityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCommunity();
    }
  }, [slug]);

  const fetchCommunity = async () => {
    try {
      const response = await api.get<{ community: CommunityDetail }>(`/communities/${slug}`);
      setCommunity(response.data.community);
    } catch (error) {
      console.error('Failed to fetch community:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!slug) return;
    setJoinLoading(true);
    try {
      await api.post(`/communities/${slug}/join`);
      fetchCommunity();
    } catch (error) {
      console.error('Failed to join:', error);
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!slug || !confirm('Are you sure you want to leave this community?')) return;
    try {
      await api.post(`/communities/${slug}/leave`);
      fetchCommunity();
    } catch (error) {
      console.error('Failed to leave:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Community not found</h1>
        <p className="text-gray-600">The community you're looking for doesn't exist.</p>
      </div>
    );
  }

  const isOwner = community.owner.id === user?.id;
  const isModerator = community.memberRole === 'OWNER' || community.memberRole === 'MODERATOR';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        {community.banner && (
          <img
            src={community.banner}
            alt=""
            className="w-full h-32 object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {community.icon ? (
                <img src={community.icon} alt="" className="w-16 h-16 rounded-lg" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center text-white text-2xl font-bold">
                  {community.name[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">{community.name}</h1>
                  {community.isPrivate && (
                    <span className="badge badge-secondary">Private</span>
                  )}
                  {community.isMember && (
                    <span className="badge badge-success">Joined</span>
                  )}
                </div>
                <p className="text-gray-600 mt-2">
                  {community.description || 'No description'}
                </p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                  <span>{community._count?.members || 0} members</span>
                  <span>{community._count?.posts || 0} posts</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {community.isMember ? (
                <>
                  <Link
                    to={`/c/${community.slug}/create`}
                    className="btn btn-primary"
                  >
                    New Post
                  </Link>
                  {!isOwner && (
                    <button
                      onClick={handleLeave}
                      className="btn btn-secondary"
                    >
                      Leave
                    </button>
                  )}
                  {isModerator && (
                    <Link
                      to={`/c/${community.slug}/moderate`}
                      className="btn btn-secondary"
                    >
                      Mod Tools
                    </Link>
                  )}
                </>
              ) : (
                <button
                  onClick={handleJoin}
                  className="btn btn-primary"
                  disabled={joinLoading}
                >
                  {joinLoading ? <span className="spinner"></span> : 'Join'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Recent Posts</h2>
          {community.recentPosts.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-gray-600 mb-4">No posts yet.</p>
              {community.isMember && (
                <Link to={`/c/${community.slug}/create`} className="btn btn-primary">
                  Create First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {community.recentPosts.map((post) => (
                <div key={post.id} className="card p-4 hover:shadow-md transition-shadow">
                  <Link to={`/p/${post.id}`}>
                    <h3 className="text-lg font-semibold hover:text-primary">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {/* Post preview would go here */}
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                    <Link
                      to={`/u/${post.author.username}`}
                      className="flex items-center space-x-1 hover:text-primary"
                    >
                      <span>u/{post.author.username}</span>
                    </Link>
                    <span>{post._count.comments} comments</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Community Rules */}
          {community.rules && (
            <div className="card">
              <div className="card-header">Community Rules</div>
              <div className="card-body">
                <div className="prose prose-sm">
                  {community.rules.split('\n').map((rule, i) => (
                    <p key={i} className="mb-2">{rule}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mods */}
          <div className="card">
            <div className="card-header">Moderators</div>
            <div className="card-body">
              <Link
                to={`/u/${community.owner.username}`}
                className="flex items-center space-x-2 mb-2 hover:text-primary"
              >
                {community.owner.image ? (
                  <img src={community.owner.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {community.owner.username[0].toUpperCase()}
                  </div>
                )}
                <span className="font-medium">{community.owner.name || community.owner.username}</span>
                <span className="badge badge-primary">Owner</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
