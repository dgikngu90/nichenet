import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ user }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          NicheNet
        </Link>
        <div className="navbar-menu">
          {!user ? (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/groups" className="navbar-link">
                Groups
              </Link>
              <div className="navbar-user">
                <span>{user.username}</span>
                <button onClick={() => {
                  localStorage.removeItem('token');
                  window.location.reload();
                }} className="navbar-logout">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
