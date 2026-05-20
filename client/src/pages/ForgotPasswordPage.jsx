import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '../api/services';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #ffd60a 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-md page-enter">
        <div className="text-center mb-8">
          <Shield size={48} className="mx-auto mb-4 text-cyber-accent"
            style={{ filter: 'drop-shadow(0 0 14px rgba(0,212,255,0.8))' }} />
          <h1 className="text-3xl font-bold text-white tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
            SAFE<span className="text-cyber-accent">NET</span>
          </h1>
        </div>

        <div className="cyber-card p-8">
          {success ? (
            <div className="text-center py-4 animate-fadeIn">
              <CheckCircle size={48} className="mx-auto mb-4"
                style={{ color: '#00ff88', filter: 'drop-shadow(0 0 12px rgba(0,255,136,0.7))' }} />
              <h2 className="text-white font-bold mb-3 tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
                RESET LINK SENT
              </h2>
              <p className="font-mono text-cyber-text text-sm mb-6">
                Check your inbox at <span className="text-cyber-accent">{email}</span> for password reset instructions.
              </p>
              <Link to="/login" className="cyber-btn cyber-btn-primary inline-flex">
                <ArrowLeft size={14} /> BACK TO LOGIN
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-white font-bold text-sm tracking-widest uppercase mb-1"
                  style={{ fontFamily: 'Orbitron, monospace' }}>Password Recovery</h2>
                <p className="font-mono text-cyber-text text-xs mt-2">
                  Enter your registered email to receive a reset link.
                </p>
                <div className="h-px bg-gradient-to-r from-yellow-400/50 to-transparent mt-3" />
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="cyber-btn cyber-btn-primary w-full justify-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="w-4 h-4 border-2 border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin" />
                      SENDING...
                    </span>
                  ) : 'SEND RESET LINK'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-cyber-border text-center">
                <Link to="/login"
                  className="inline-flex items-center gap-2 font-mono text-xs text-cyber-muted hover:text-cyber-accent transition-colors tracking-wider">
                  <ArrowLeft size={12} /> BACK TO LOGIN
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
