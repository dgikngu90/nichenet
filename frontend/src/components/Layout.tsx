import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { connected } = useSocket();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-bold text-xl text-primary">
              SafeNiche
            </Link>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded ${isActive('/') ? 'bg-gray-100' : ''}`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/create"
                    className={`px-3 py-2 rounded ${isActive('/create') ? 'bg-gray-100' : ''}`}
                  >
                    Create
                  </Link>
                  <Link
                    to="/notifications"
                    className={`px-3 py-2 rounded ${isActive('/notifications') ? 'bg-gray-100' : ''}`}
                  >
                    Notifications
                  </Link>
                  {!connected && (
                    <span className="text-xs text-red-500" title="Disconnected">
                      ●
                    </span>
                  )}
                </>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded hover:bg-gray-100"
                title="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {user ? (
                <div className="flex items-center space-x-3">
                  <Link to={`/u/${user.username}`} className="flex items-center space-x-2">
                    {user.image ? (
                      <img src={user.image} alt={user.name || user.username} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        {(user.name || user.username)[0].toUpperCase()}
                      </div>
                    )}
                    <span className="hidden md:inline">{user.name || user.username}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="btn btn-secondary btn-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="btn btn-secondary btn-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>&copy; 2025 SafeNiche. A safe place for niche communities.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
