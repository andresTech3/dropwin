import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import AIChat from './pages/AIChat';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Trends from './pages/Trends';
import './styles/design-tokens.css';
import './App.css';

function ProtectedLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <Login />
      } />
      <Route path="/" element={
        <ProtectedLayout><Dashboard /></ProtectedLayout>
      } />
      <Route path="/products" element={
        <ProtectedLayout><Products /></ProtectedLayout>
      } />
      <Route path="/products/:id" element={
        <ProtectedLayout><ProductDetail /></ProtectedLayout>
      } />
      <Route path="/ai-chat" element={
        <ProtectedLayout><AIChat /></ProtectedLayout>
      } />
      <Route path="/admin" element={
        <ProtectedLayout><Admin /></ProtectedLayout>
      } />
      <Route path="/trends" element={
        <ProtectedLayout><Trends /></ProtectedLayout>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141516',
              color: '#f7f8f8',
              border: '1px solid #23252a',
              borderRadius: '8px',
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#27a644', secondary: '#141516' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#141516' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
