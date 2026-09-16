import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// Shared shell (navbar + sidebar) for every logged-in admin/student screen
const AppLayout = () => (
  <div className="app-shell">
    <Navbar />
    <div className="app-body">
      <Sidebar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AppLayout;
