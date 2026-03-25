import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    isPrivate: false,
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      // Convert tags string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const res = await axios.post('http://localhost:5000/api/groups', {
        ...formData,
        tags: tagsArray
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Group created successfully!');
      // Redirect to group detail page after a short delay
      setTimeout(() => {
        navigate(`/groups/${res.data._id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <Navbar user={{ username: localStorage.getItem('user') || 'User' }} />
      <main>
        <div className="page-header">
          <h1>Create a New Group</h1>
          <p>Build a community around your specific interest</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="create-group-form">
          <div className="form-group">
            <label htmlFor="name">Group Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength="50"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              maxLength="500"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., technology, programming, javascript"
            />
            <p className="help-text">Add tags to help people find your group</p>
          </div>
          
          <div className="form-group">
            <label htmlFor="avatar">Avatar URL (optional)</label>
            <input
              type="text"
              id="avatar"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
              />
              <label htmlFor="isPrivate">Make this group private (approval required to join)</label>
            </div>
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Group...' : 'Create Group'}
          </button>
          
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateGroup;
