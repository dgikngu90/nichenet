import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GroupList from './pages/GroupList';
import GroupDetail from './pages/GroupDetail';
import './styles/App.css';

// Private route component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/groups" element={<PrivateRoute><GroupList /></PrivateRoute>} />
          <Route path="/groups/:id" element={<PrivateRoute><GroupDetail /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
