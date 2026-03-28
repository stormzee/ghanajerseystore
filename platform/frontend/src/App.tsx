import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CryptoProvider } from './contexts/CryptoContext';
import ProtectedLayout from './pages/ProtectedLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import TaskDetail from './pages/TaskDetail';
import Messages from './pages/Messages';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CryptoProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Feed />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:peerId" element={<Messages />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CryptoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
