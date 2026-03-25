import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const SettingsPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put('/auth/profile', formData);
      setMessage('Profile updated successfully!');
    } catch (error: any) {
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {message && <div className="alert alert-success mb-6">{message}</div>}

      <div className="card mb-6">
        <div className="card-header">Profile Settings</div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                className="form-textarea"
                value={formData.bio}
                onChange={handleChange}
                maxLength={500}
                rows={4}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header">Security</div>
        <div className="card-body">
          <button className="btn btn-secondary mb-2">Change Password</button>
          <button className="btn btn-secondary">Enable Two-Factor Auth</button>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header">Privacy</div>
        <div className="card-body">
          <p className="text-gray-600">
            Privacy settings coming soon. You'll be able to control who can see your
            activity, send you messages, and more.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Danger Zone</div>
        <div className="card-body">
          <p className="text-gray-600 mb-4">
            Permanently delete your account and all associated data.
          </p>
          <button className="btn btn-danger" disabled>
            Delete Account (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
