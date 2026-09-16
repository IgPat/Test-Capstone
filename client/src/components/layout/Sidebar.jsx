import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  Receipt,
  Megaphone,
  UserCheck,
} from 'lucide-react';

const ADMIN_LINKS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/classes', label: 'Classes', icon: BookOpen },
  { path: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/admin/grades', label: 'Grades', icon: GraduationCap },
  { path: '/admin/invoices', label: 'Fees & Invoices', icon: Receipt },
  { path: '/admin/announcements', label: 'Announcements', icon: Megaphone },
];

const STUDENT_LINKS = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/profile', label: 'My Profile', icon: UserCheck },
  { path: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
  { path: '/student/grades', label: 'My Report Card', icon: GraduationCap },
  { path: '/student/invoices', label: 'My Fees', icon: Receipt },
  { path: '/student/announcements', label: 'Announcements', icon: Megaphone },
];

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? ADMIN_LINKS : STUDENT_LINKS;

  return (
    <nav className="sidebar">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
