import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CommunityPage from './pages/CommunityPage';
import CommunityCreatePage from './pages/CommunityCreatePage';
import PostPage from './pages/PostPage';
import SearchPage from './pages/SearchPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="c/:slug" element={<CommunityPage />} />
              <Route path="c/:slug/create" element={
                <PrivateRoute>
                  <CommunityCreatePage />
                </PrivateRoute>
              } />
              <Route path="p/:id" element={<PostPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="notifications" element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              } />
              <Route path="u/:username" element={<ProfilePage />} />
              <Route path="settings" element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              } />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
