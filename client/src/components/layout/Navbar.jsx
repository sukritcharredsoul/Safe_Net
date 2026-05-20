import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Shield, Activity, Search, Home, LogOut, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const navLinks = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/scan', label: 'Scan', icon: Search },
  { to: '/activity', label: 'Activity', icon: Activity },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(5,8,16,0.92)',
        borderBottom: '1px solid #1a2a4a',
        backdropFilter: 'blur(20px)',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <Shield size={28} className="text-cyber-accent" style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.7))' }} />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Shield size={28} className="text-cyber-accent" />
            </div>
          </div>
          <span
            className="font-display font-bold text-lg tracking-widest text-white"
            style={{ fontFamily: 'Orbitron, monospace' }}>
            SAFE<span className="text-cyber-accent" style={{ textShadow: '0 0 10px rgba(0,212,255,0.8)' }}>NET</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-4 py-2 rounded text-xs font-mono tracking-widest uppercase transition-all duration-300"
                style={{
                  color: active ? '#00d4ff' : '#a8b8d8',
                  background: active ? 'rgba(0,212,255,0.08)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                  textShadow: active ? '0 0 8px rgba(0,212,255,0.6)' : 'none',
                }}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded"
              style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid #1a2a4a' }}>
              <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(0,255,136,0.8)' }} />
              <span className="font-mono text-xs text-cyber-text">{user.name || user.email}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded border border-transparent text-xs font-mono uppercase tracking-wider text-cyber-text hover:border-cyber-red hover:text-cyber-red transition-all duration-300"
          >
            <LogOut size={14} />
            <span className="hidden sm:block">Logout</span>
          </button>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-cyber-text"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="space-y-1">
              <span className="block w-5 h-0.5 bg-cyber-accent" />
              <span className="block w-5 h-0.5 bg-cyber-accent" />
              <span className="block w-5 h-0.5 bg-cyber-accent" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 border-t border-cyber-border animate-fadeIn">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-3 text-sm font-mono text-cyber-text hover:text-cyber-accent transition-colors border-b border-cyber-border"
            >
              <ChevronRight size={14} className="text-cyber-accent" />
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
