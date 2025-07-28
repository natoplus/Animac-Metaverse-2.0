// src/pages/admin/index.js

import React from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import AdminDashboard from './AdminDashboard'; // ✅ Adjust path if moved

export default function AdminPage() {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-300">
        <p>🔄 Verifying admin access...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        <p>⛔ Access Denied: You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <AdminDashboard />
    </main>
  );
}
