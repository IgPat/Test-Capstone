import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../../pages/auth/RebuiltPages.css';

export default function AppLayout() {
  return (
    <div className="rebuilt-shell">
      <Navbar />
      <div className="rebuilt-app-body">
        <Sidebar />
        <main className="rebuilt-main-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
