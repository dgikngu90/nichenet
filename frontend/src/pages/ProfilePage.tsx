import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const response = await api.get<{ user: any }>(`/users/${username}`);
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
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

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-start space-x-4">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name || profile.username}
                className="w-20 h-20 rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {(profile.name || profile.username)[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {profile.name || profile.username}
              </h1>
              <p className="text-gray-600">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 text-gray-800">{profile.bio}</p>
              )}
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
                <span>{profile._count?.posts || 0} posts</span>
                <span>{profile._count?.comments || 0} comments</span>
                <span>{profile._count?.ownedCommunities || 0} communities</span>
                <span>{profile._count?.followers || 0} followers</span>
                <span>{profile._count?.following || 0} following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <p className="text-gray-600">Activity feed coming soon...</p>
      </div>
    </div>
  );
};

export default ProfilePage;
