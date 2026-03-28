import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, MessageCircle, Home, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14">
        <Link to="/" className="text-lg font-bold text-brand-700 tracking-tight">
          TaskCollab
        </Link>

        {user && (
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
            >
              <Home className="w-4 h-4" />
              Feed
            </Link>
            <Link
              to="/messages"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </Link>
            <span className="px-3 py-1.5 text-sm text-gray-500 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              @{user.username}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
