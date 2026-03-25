import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/groups', {
          params: { tag: tagFilter, search },
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroups(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [search, tagFilter]);

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="group-list-page">
      <Navbar user={{ username: localStorage.getItem('user') || 'User' }} />
      <main>
        <div className="page-header">
          <h1>Discover Communities</h1>
          <p>Find groups built around your specific interests</p>
          <Link to="/groups/create" className="btn-primary">
            Create Your Own Group
          </Link>
        </div>
        
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="filter-select">
            <option value="">All Tags</option>
            <option value="technology">Technology</option>
            <option value="arts">Arts & Crafts</option>
            <option value="books">Books & Literature</option>
            <option value="games">Games</option>
            <option value="food">Food & Cooking</option>
            <option value="fitness">Fitness & Wellness</option>
            <option value="collectibles">Collectibles</option>
          </select>
        </div>
        
        {groups.length === 0 ? (
          <div className="empty-state">
            <h3>No groups found</h3>
            <p>Try adjusting your search or filters</p>
            <Link to="/groups/create" className="btn-secondary">
              Create a Group
            </Link>
          </div>
        ) : (
          <div className="groups-grid">
            {groups.map(group => (
              <div key={group._id} className="group-card">
                {group.avatar && (
                  <img src={group.avatar} alt={`${group.name} avatar`} className="group-avatar" />
                )}
                <div className="group-info">
                  <h3>{group.name}</h3>
                  <p className="group-description">{group.description}</p>
                  <div className="group-meta">
                    <span className="member-count">
                      {group.members?.length || 0} members
                    </span>
                    {group.tags && group.tags.length > 0 && (
                      <div className="group-tags">
                        {group.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Link to={`/groups/${group._id}`} className="btn-secondary">
                    View Group
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GroupList;
