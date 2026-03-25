import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';

const CommunityCreatePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: '',
    isPrivate: false,
    requiresApproval: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Generate slug from name
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);

      const response = await api.post('/communities', {
        ...formData,
        slug: generatedSlug,
      });
      navigate(`/c/${response.data.community.slug}`);
    } catch (error: any) {
      setError(error.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-centered">
      <div className="mb-8">
        <Link to="/" className="text-primary hover:underline font-medium mb-4 inline-flex items-center gap-2">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Create Your Community</h1>
        <p className="text-secondary">
          Build a space for your niche. Connect with like-minded people.
        </p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <div>
                <strong>Creation Failed</strong>
                <p className="mt-1 mb-0">{error}</p>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Community Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={50}
              pattern="[a-zA-Z0-9\s]+"
              title="Only letters, numbers, and spaces allowed"
              placeholder="e.g., Tech Enthusiasts"
            />
            <p className="text-sm text-tertiary mt-2">
              This will be displayed prominently across the platform
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              maxLength={1000}
              rows={4}
              placeholder="What is your community about? What topics will be discussed?"
            />
            <p className="text-sm text-tertiary mt-2">
              Maximum 1000 characters
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Community Rules</label>
            <textarea
              name="rules"
              className="form-textarea"
              value={formData.rules}
              onChange={handleChange}
              maxLength={2000}
              rows={6}
              placeholder="List your community rules, one per line...&#10;Example:&#10;Be respectful to others&#10;No spam or self-promotion&#10;Stay on topic"
            />
            <p className="text-sm text-tertiary mt-2">
              These rules will be displayed in the community sidebar and should outline expected behavior
            </p>
          </div>

          <div className="card p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <h3 className="font-semibold mb-4">Privacy & Access</h3>
            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" style={{ backgroundColor: 'var(--bg-primary)' }}>
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold">Private Community</div>
                  <div className="text-sm text-tertiary">
                    Only invited members can join. Your community won't appear in public listings.
                  </div>
                </div>
              </label>

              {!formData.isPrivate && (
                <label className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <input
                    type="checkbox"
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-semibold">Require Approval</div>
                    <div className="text-sm text-tertiary">
                      New members must be approved by moderators before joining.
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Create Community
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <h3 className="font-semibold mb-3">💡 Tips for a great community</h3>
        <ul className="space-y-2 text-secondary text-sm">
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            Choose a clear, descriptive name that reflects your community's purpose
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            Write a compelling description to attract members
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            Set clear, reasonable rules to foster a positive environment
          </li>
          <li className="flex items-start gap-2">
            <span className="text-success">✓</span>
            You can always edit these settings later
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CommunityCreatePage;
