import { useState } from 'react';
import { GraduationCap, Menu, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import './PublicSiteFrame.css';

const links = [
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/privacy', label: 'Privacy' },
];

export default function PublicSiteFrame({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  return (
    <div className="public-site">
      <header className="public-site-header">
        <div className="public-site-header-inner">
          <Link className="public-site-brand" to="/" onClick={closeMenu}>
            <span><GraduationCap size={20} /></span>EduCore<span className="public-site-period">.</span>
          </Link>
          <button className="public-menu-button" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <nav className={menuOpen ? 'public-site-nav is-open' : 'public-site-nav'} aria-label="Main navigation">
            {links.map((link) => <NavLink key={link.to} to={link.to} onClick={closeMenu}>{link.label}</NavLink>)}
            <Link className="public-login-link" to="/login" onClick={closeMenu}>Sign in</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="public-site-footer">
        <Link className="public-site-brand" to="/"><span><GraduationCap size={18} /></span>EduCore<span className="public-site-period">.</span></Link>
        <p>School records, kept clear and connected.</p>
        <nav aria-label="Footer navigation">{links.map((link) => <Link key={link.to} to={link.to}>{link.label}</Link>)}</nav>
      </footer>
    </div>
  );
}