import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface Community {
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

const HomePage = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState<Community[]>([]);
  const [discover, setDiscover] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trendingRes, discoverRes] = await Promise.all([
        api.get<{ communities: Community[] }>('/communities/trending'),
        api.get<{ communities: Community[] }>('/communities/discover'),
      ]);

      setTrending(trendingRes.data.communities);
      setDiscover(discoverRes.data.communities);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to SafeNiche</h1>
          <p className="hero-subtitle">
            Find your community. Build real connections. Stay safe.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/c/create" className="btn btn-xl btn-primary">
                <span>✨</span>
                Create a Community
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-xl btn-primary">
                  <span>🚀</span>
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-xl btn-secondary">
                  <span>✉️</span>
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Trending Communities */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">🔥 Trending Communities</h2>
          <Link to="/search?type=communities" className="text-primary hover:underline font-medium">
            View All →
          </Link>
        </div>
        {trending.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚀</div>
            <h3 className="empty-state-title">No communities yet</h3>
            <p className="empty-state-description">
              Be the first to create a community and start the conversation!
            </p>
            {user && (
              <Link to="/c/create" className="btn btn-primary btn-lg">
                Create Community
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-1 md:grid-2 lg:grid-3 gap-6">
            {trending.map((community) => (
              <Link
                key={community.id}
                to={`/c/${community.slug}`}
                className="community-card"
              >
                <div className="community-icon">
                  {community.icon ? (
                    <img src={community.icon} alt="" className="w-full h-full object-cover rounded" />
                  ) : (
                    community.name[0].toUpperCase()
                  )}
                </div>
                <div className="community-info">
                  <h3 className="community-name">{community.name}</h3>
                  <p className="community-description">
                    {community.description || 'No description'}
                  </p>
                  <div className="community-stats">
                    <span>👥 {(community._count?.members || 0).toLocaleString()}</span>
                    <span>📝 {(community._count?.posts || 0).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Discover Communities */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">✨ Discover New Communities</h2>
          <Link to="/search?type=communities" className="text-primary hover:underline font-medium">
            Explore All →
          </Link>
        </div>
        {discover.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <h3 className="empty-state-title">
              {user
                ? "You've explored everything!"
                : 'No public communities yet'}
            </h3>
            <p className="empty-state-description">
              {user
                ? "You're a member of all available communities. Check back later for new ones!"
                : 'When communities are created, they will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-1 md:grid-2 lg:grid-3 gap-6">
            {discover.map((community) => (
              <Link
                key={community.id}
                to={`/c/${community.slug}`}
                className="community-card"
              >
                <div className="community-info">
                  <h3 className="community-name">{community.name}</h3>
                  <p className="community-description">
                    {community.description || 'No description'}
                  </p>
                  <div className="mt-4">
                    <span className="badge badge-primary">Public</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
