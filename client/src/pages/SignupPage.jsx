import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';
import { signup } from '../api/services';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(form.password);
  const strengthLabels = ['', 'WEAK', 'FAIR', 'STRONG', 'ELITE'];
  const strengthColors = ['', '#ff2d55', '#ffd60a', '#00d4ff', '#00ff88'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center page-enter">
          <div className="cyber-card p-10">
            <CheckCircle size={64} className="mx-auto mb-6" style={{ color: '#00ff88', filter: 'drop-shadow(0 0 16px rgba(0,255,136,0.7))' }} />
            <h2 className="text-2xl font-bold text-white mb-3 tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
              REGISTRATION COMPLETE
            </h2>
            <p className="font-mono text-cyber-text text-sm mb-2">Account created successfully.</p>
            <p className="font-mono text-cyber-accent text-xs mb-8">CHECK YOUR EMAIL TO VERIFY YOUR ACCOUNT</p>
            <button onClick={() => navigate('/login')} className="cyber-btn cyber-btn-primary">
              PROCEED TO LOGIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md page-enter">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield size={48} className="text-cyber-accent"
              style={{ filter: 'drop-shadow(0 0 14px rgba(0,212,255,0.8))' }} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
            SAFE<span className="text-cyber-accent" style={{ textShadow: '0 0 10px rgba(0,212,255,0.8)' }}>NET</span>
          </h1>
          <p className="text-cyber-text font-mono text-sm tracking-wider">CREATE YOUR ACCOUNT</p>
        </div>

        <div className="cyber-card p-8">
          <div className="mb-6">
            <h2 className="text-white font-display text-sm tracking-widest uppercase mb-1" style={{ fontFamily: 'Orbitron, monospace' }}>
              New Registration
            </h2>
            <div className="h-px bg-gradient-to-r from-cyber-green/50 to-transparent mt-2" />
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
                <span className="flex items-center gap-2"><User size={10} /> Full Name</span>
              </label>
              <input
                type="text"
                className="cyber-input"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
              />
            </div>

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
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-accent transition-colors"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= strength ? strengthColors[strength] : '#1a2a4a',
                          boxShadow: i <= strength ? `0 0 6px ${strengthColors[strength]}66` : 'none',
                        }} />
                    ))}
                  </div>
                  <p className="text-xs font-mono" style={{ color: strengthColors[strength] }}>
                    STRENGTH: {strengthLabels[strength]}
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cyber-btn cyber-btn-green w-full justify-center mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-3">
                  <span className="w-4 h-4 border-2 border-cyber-green/30 border-t-cyber-green rounded-full animate-spin" />
                  CREATING ACCOUNT...
                </span>
              ) : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-cyber-border text-center">
            <p className="font-mono text-xs text-cyber-muted">
              ALREADY REGISTERED?{' '}
              <Link to="/login" className="text-cyber-accent hover:text-white transition-colors ml-1 tracking-wider">
                SIGN IN
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
