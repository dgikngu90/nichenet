import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Link, useParams } from 'react-router-dom';

const GroupDetail = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userIdFromStorage = localStorage.getItem('userId');
        setUserId(userIdFromStorage);

        // Fetch group details
        const groupRes = await axios.get(`http://localhost:5000/api/groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroup(groupRes.data);

        // Check if user is a member
        setIsMember(groupRes.data.members.some(member => member._id.toString() === userIdFromStorage));

        // Fetch events for this group
        const eventsRes = await axios.get('http://localhost:5000/api/events', {
          params: { groupId: id },
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(eventsRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load group details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleJoinLeave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (isMember) {
        // Leave group
        await axios.post(`http://localhost:5000/api/groups/${id}/leave`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsMember(false);
        // Update group members count (optimistic update)
        setGroup(prev => ({
          ...prev,
          members: prev.members.filter(member => member._id.toString() !== userId)
        }));
      } else {
        // Join group
        await axios.post(`http://localhost:5000/api/groups/${id}/join`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsMember(true);
        // Update group members count (optimistic update)
        setGroup(prev => ({
          ...prev,
          members: [...prev.members, { _id: userId }] // Simplified, in reality we'd fetch the user object
        }));
      }
    } catch (err) {
      console.error(err);
      setError(isMember ? 'Failed to leave group' : 'Failed to join group');
    }
  };

  if (loading) return <div>Loading group...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!group) return <div>Group not found</div>;

  return (
    <div className="group-detail-page">
      <Navbar user={{ username: localStorage.getItem('user') || 'User' }} />
      <main>
        <div className="group-header">
          {group.avatar && (
            <img src={group.avatar} alt={`${group.name} avatar`} className="group-avatar-large" />
          )}
          <div className="group-info">
            <h1>{group.name}</h1>
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
              {!isMember && (
                <button onClick={handleJoinLeave} className="btn-primary">
                  Join Group
                </button>
              )}
              {isMember && (
                <button onClick={handleJoinLeave} className="btn-secondary">
                  Leave Group
                </button>
              )}
              {group.creator._id.toString() === userId && (
                <Link to={`/groups/${id}/edit`} className="btn-secondary">
                  Edit Group
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="group-tabs">
          <button className="tab-button active">Discussions</button>
          <button className="tab-button">Members</button>
          <button className="tab-button">Events</button>
        </div>

        <div className="tab-content">
          {/* Discussions Tab (Placeholder) */}
          <div className="tab-panel active">
            <h2>Discussions</h2>
            <p>Discussion feature coming soon!</p>
          </div>

          {/* Members Tab */}
          <div className="tab-panel">
            <h2>Members</h2>
            {group.members && group.members.length > 0 ? (
              <div className="members-grid">
                {group.members.map(member => (
                  <div key={member._id} className="member-card">
                    {member.avatar && (
                      <img src={member.avatar} alt={`${member.username}'s avatar`} className="member-avatar" />
                    )}
                    <div className="member-info">
                      <h3>{member.username}</h3>
                      {member.bio && <p className="member-bio">{member.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No members yet</p>
            )}
          </div>

          {/* Events Tab */}
          <div className="tab-panel">
            <h2>Events</h2>
            {group.creator._id.toString() === userId && (
              <Link to={`/groups/${id}/events/create`} className="btn-primary mb-4">
                Create Event
              </Link>
            )}
            {events.length === 0 ? (
              <p>No events in this group yet.</p>
            ) : (
              <div className="events-list">
                {events.map(event => (
                  <div key={event._id} className="event-card">
                    <h3>{event.title}</h3>
                    <p className="event-date">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="event-location">{event.location}</p>
                    {event.isPaid && (
                      <span className="event-price">$${event.price}</span>
                    )}
                    <div className="event-actions">
                      <Link to={`/events/${event._id}`} className="btn-secondary">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupDetail;
