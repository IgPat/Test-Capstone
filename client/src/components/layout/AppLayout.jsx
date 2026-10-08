import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../../pages/auth/RebuiltPages.css';

export default function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarOpen((prev) => !prev);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="rebuilt-shell">
      <Navbar onToggleSidebar={toggleMobileSidebar} isSidebarOpen={mobileSidebarOpen} />
      <div className="rebuilt-app-body">
        {mobileSidebarOpen && (
          <div className="rebuilt-sidebar-overlay" onClick={closeMobileSidebar} />
        )}
        <Sidebar isOpen={mobileSidebarOpen} onClose={closeMobileSidebar} />
        <main className="rebuilt-main-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

