import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    };

    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/groups', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
    fetchGroups();
    fetchEvents();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <Navbar user={user} />
      <main>
        <div className="dashboard-header">
          <h1>Welcome, {user.username}!</h1>
          <p>Here's what's happening in your niche communities</p>
        </div>
        
        <div className="dashboard-content">
          <div className="dashboard-section">
            <h2>Your Groups</h2>
            {groups.length === 0 ? (
              <p>You haven't joined any groups yet. <a href="/groups">Explore groups</a></p>
            ) : (
              <div className="groups-grid">
                {groups.map(group => (
                  <div key={group._id} className="group-card">
                    <h3>{group.name}</h3>
                    <p>{group.description.substring(0, 100)}...</p>
                    <a href={`/groups/${group._id}`} className="btn-secondary">View Group</a>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="dashboard-section">
            <h2>Upcoming Events</h2>
            {events.length === 0 ? (
              <p>No upcoming events. <a href="/groups">Find events in groups</a></p>
            ) : (
              <div className="events-list">
                {events.map(event => (
                  <div key={event._id} className="event-card">
                    <h3>{event.title}</h3>
                    <p>{new Date(event.date).toLocaleDateString()}</p>
                    <p>{event.location}</p>
                    {event.isPaid && (
                      <span className="event-price">$${event.price}</span>
                    )}
                    <a href={`/groups/${event.group}`} className="btn-secondary">View Event</a>
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

export default Dashboard;
