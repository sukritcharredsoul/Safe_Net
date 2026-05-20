import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center page-enter">
        <div className="font-bold mb-4 select-none"
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 'clamp(80px, 20vw, 160px)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(0,212,255,0.3)',
            lineHeight: 1,
          }}>
          404
        </div>
        <Shield size={48} className="mx-auto mb-6" style={{ color: '#ff2d55', filter: 'drop-shadow(0 0 14px rgba(255,45,85,0.7))' }} />
        <h1 className="text-2xl font-bold text-white mb-3 tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
          ACCESS DENIED
        </h1>
        <p className="font-mono text-cyber-muted text-sm mb-8 max-w-sm mx-auto">
          The resource you requested could not be located in the system.
        </p>
        <Link to="/dashboard" className="cyber-btn cyber-btn-primary inline-flex items-center gap-2">
          <Home size={14} /> RETURN TO BASE
        </Link>
      </div>
    </div>
  );
}
