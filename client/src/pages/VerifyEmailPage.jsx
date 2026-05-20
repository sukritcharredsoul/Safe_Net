import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { verifyEmail } from '../api/services';

export default function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await verifyEmail(token);
        setMessage(res.data?.message || 'Email verified successfully.');
        setStatus('success');
      } catch (err) {
        setMessage(err.response?.data?.message || 'Invalid or expired verification token.');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center page-enter">
        <div className="cyber-card p-10">
          <Shield size={48} className="mx-auto mb-6 text-cyber-accent"
            style={{ filter: 'drop-shadow(0 0 14px rgba(0,212,255,0.8))' }} />

          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-2 border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-white font-bold tracking-widest mb-3" style={{ fontFamily: 'Orbitron, monospace' }}>
                VERIFYING EMAIL
              </h2>
              <p className="font-mono text-cyber-text text-sm">Processing verification token...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle size={56} className="mx-auto mb-6"
                style={{ color: '#00ff88', filter: 'drop-shadow(0 0 16px rgba(0,255,136,0.7))' }} />
              <h2 className="text-white font-bold tracking-widest mb-3" style={{ fontFamily: 'Orbitron, monospace' }}>
                EMAIL VERIFIED
              </h2>
              <p className="font-mono text-cyber-text text-sm mb-8">{message}</p>
              <Link to="/login" className="cyber-btn cyber-btn-green inline-flex">
                PROCEED TO LOGIN
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle size={56} className="mx-auto mb-6"
                style={{ color: '#ff2d55', filter: 'drop-shadow(0 0 16px rgba(255,45,85,0.7))' }} />
              <h2 className="text-white font-bold tracking-widest mb-3" style={{ fontFamily: 'Orbitron, monospace' }}>
                VERIFICATION FAILED
              </h2>
              <p className="font-mono text-cyber-text text-sm mb-8">{message}</p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link to="/signup" className="cyber-btn cyber-btn-primary inline-flex">REGISTER AGAIN</Link>
                <Link to="/login" className="cyber-btn cyber-btn-ghost inline-flex">LOGIN</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
