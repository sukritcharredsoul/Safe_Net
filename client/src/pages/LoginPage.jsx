import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { login } from '../api/services';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      const { token, user } = res.data;
      setAuth(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #7b2fff 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md page-enter">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Shield size={56} className="text-cyber-accent"
                style={{ filter: 'drop-shadow(0 0 16px rgba(0,212,255,0.8))' }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-widest"
            style={{ fontFamily: 'Orbitron, monospace' }}>
            SAFE<span className="text-cyber-accent" style={{ textShadow: '0 0 10px rgba(0,212,255,0.8)' }}>NET</span>
          </h1>
          <p className="text-cyber-text font-mono text-sm tracking-wider">SECURE ACCESS TERMINAL</p>
        </div>

        {/* Card */}
        <div className="cyber-card p-8">
          <div className="mb-6">
            <h2 className="text-white font-display text-sm tracking-widest uppercase mb-1"
              style={{ fontFamily: 'Orbitron, monospace' }}>Authentication</h2>
            <div className="h-px bg-gradient-to-r from-cyber-accent/50 to-transparent mt-2" />
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 p-3 rounded border border-cyber-red/30 bg-cyber-red/5 animate-fadeIn">
              <AlertCircle size={16} className="text-cyber-red shrink-0" />
              <p className="text-cyber-red text-sm font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="cyber-label">
                <span className="flex items-center gap-2"><Mail size={10} /> Email Address</span>
              </label>
              <input
                type="email"
                className="cyber-input"
                placeholder="user@domain.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="cyber-label">
                <span className="flex items-center gap-2"><Lock size={10} /> Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="cyber-input pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-accent transition-colors"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password"
                  className="text-xs font-mono text-cyber-accent hover:text-white transition-colors tracking-wider">
                  FORGOT PASSWORD?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn cyber-btn-primary w-full justify-center mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <span className="w-4 h-4 border-2 border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin" />
                  AUTHENTICATING...
                </span>
              ) : 'INITIATE SESSION'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-cyber-border text-center">
            <p className="font-mono text-xs text-cyber-muted">
              NO ACCOUNT?{' '}
              <Link to="/signup" className="text-cyber-accent hover:text-white transition-colors ml-1 tracking-wider">
                REGISTER NOW
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-cyber-muted font-mono text-xs mt-6 tracking-widest">
          &copy; {new Date().getFullYear()} SAFENET SECURITY SYSTEMS
        </p>
      </div>
    </div>
  );
}
