import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div className="app-shell">
        <Sidebar />
        <main className="main-area">
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
