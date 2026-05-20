import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, AlertTriangle, RefreshCw, Database,
  Activity, ExternalLink, Search, CheckCircle,
  Wifi, Clock, FileText, Globe
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { checkBreach, getRecentActivity, getHealth } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

function StatCard({ icon: Icon, label, value, color = '#00d4ff' }) {
  return (
    <div className="cyber-card p-4 flex items-center gap-4">
      <div className="p-3 rounded" style={{ background: `${color}15`, border: `1px solid ${color}33` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="font-mono text-xs text-cyber-muted tracking-wider uppercase">{label}</p>
        <p className="text-white font-bold text-lg" style={{ fontFamily: 'Orbitron, monospace' }}>{value}</p>
      </div>
    </div>
  );
}

function BreachCard({ user }) {
  const [loading, setLoading] = useState(false);
  const [breachData, setBreachData] = useState(null);
  const [error, setError] = useState('');
  const [checked, setChecked] = useState(false);

  const fetchBreach = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await checkBreach(user?.email || '');
      setBreachData(res.data);
      setChecked(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setBreachData({ breaches: [] });
        setChecked(true);
      } else {
        setError(err.response?.data?.message || 'Failed to check breach data.');
      }
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) fetchBreach();
  }, []);

  const breaches = breachData?.breaches || breachData?.data || [];
  const isBreached = Array.isArray(breaches) ? breaches.length > 0 : !!breachData;

  return (
    <div className="cyber-card p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Database size={18} style={{ color: isBreached && checked ? '#ff2d55' : '#00d4ff' }} />
          <h3 className="font-bold text-white text-sm tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
            BREACH MONITOR
          </h3>
        </div>
        <button
          onClick={fetchBreach}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded border border-cyber-border text-cyber-muted hover:border-cyber-accent hover:text-cyber-accent transition-all duration-300 text-xs font-mono"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      <div className="mb-4 p-3 rounded" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid #1a2a4a' }}>
        <p className="font-mono text-xs text-cyber-muted mb-1">MONITORING EMAIL</p>
        <p className="font-mono text-cyber-accent text-sm">{user?.email || '---'}</p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-xs text-cyber-muted">SCANNING BREACH DATABASES...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-3 rounded border border-cyber-red/30 bg-cyber-red/5 text-cyber-red font-mono text-xs flex items-center gap-2">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {checked && !loading && !error && (
        <div className="animate-fadeIn">
          {!isBreached ? (
            <div className="text-center py-6">
              <CheckCircle size={40} className="mx-auto mb-3" style={{ color: '#00ff88', filter: 'drop-shadow(0 0 10px rgba(0,255,136,0.6))' }} />
              <p className="font-bold text-white text-sm tracking-widest mb-1" style={{ fontFamily: 'Orbitron, monospace' }}>ALL CLEAR</p>
              <p className="font-mono text-cyber-text text-xs">No breaches found for this email.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4 p-3 rounded border border-cyber-red/30 bg-cyber-red/5">
                <AlertTriangle size={16} className="text-cyber-red shrink-0" />
                <div>
                  <p className="text-cyber-red font-bold text-sm" style={{ fontFamily: 'Orbitron, monospace' }}>
                    {Array.isArray(breaches) ? breaches.length : '?'} BREACH{Array.isArray(breaches) && breaches.length !== 1 ? 'ES' : ''} DETECTED
                  </p>
                  <p className="text-cyber-red/70 font-mono text-xs">Your email was found in data leaks</p>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Array.isArray(breaches) && breaches.map((breach, i) => (
                  <div key={i} className="p-3 rounded" style={{ background: 'rgba(255,45,85,0.05)', border: '1px solid rgba(255,45,85,0.2)' }}>
                    <p className="text-white font-mono text-xs font-bold mb-1">{breach.Name || breach.name || `Breach #${i + 1}`}</p>
                    {breach.BreachDate && <p className="text-cyber-muted font-mono text-xs">DATE: {breach.BreachDate}</p>}
                    {breach.DataClasses && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {breach.DataClasses.slice(0, 3).map((d, j) => (
                          <span key={j} className="px-2 py-0.5 text-xs font-mono rounded"
                            style={{ background: 'rgba(255,45,85,0.15)', color: '#ff2d55', border: '1px solid rgba(255,45,85,0.3)' }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActivityFeed({ activities }) {
  const getIcon = (type) => {
    if (type === 'FILE_SCAN') return FileText;
    if (type === 'URL_SCAN') return Globe;
    return Activity;
  };

  const getRiskColor = (level) => {
    if (!level) return '#a8b8d8';
    const l = level.toLowerCase();
    if (l === 'high') return '#ff2d55';
    if (l === 'medium') return '#ffd60a';
    return '#00ff88';
  };

  if (!activities?.length) {
    return (
      <div className="text-center py-10">
        <Activity size={36} className="mx-auto mb-3 text-cyber-muted opacity-50" />
        <p className="font-mono text-cyber-muted text-xs tracking-widest">NO RECENT ACTIVITY</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((item, i) => {
        const Icon = getIcon(item.actionType);
        const riskColor = getRiskColor(item.result?.riskLevel);
        return (
          <div key={item._id || i}
            className="flex items-center gap-4 p-3 rounded transition-all duration-300 hover:border-cyber-accent/30"
            style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid #1a2a4a' }}>
            <div className="p-2 rounded shrink-0" style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Icon size={14} className="text-cyber-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs text-white truncate">{item.input}</p>
              <p className="font-mono text-xs text-cyber-muted">{item.actionType?.replace('_', ' ')}</p>
            </div>
            {item.result && (
              <div className="text-right shrink-0">
                <p className="font-bold text-xs" style={{ color: riskColor, fontFamily: 'Orbitron, monospace' }}>
                  {item.result.riskScore ?? '—'}
                </p>
                <p className="font-mono text-xs" style={{ color: riskColor }}>
                  {item.result.riskLevel || ''}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const res = await getRecentActivity();
        setActivities(res.data?.activities || res.data?.data || res.data || []);
      } catch {
        setActivities([]);
      } finally {
        setActivityLoading(false);
      }
    };
    const loadHealth = async () => {
      try {
        await getHealth();
        setServerStatus('online');
      } catch {
        setServerStatus('offline');
      }
    };
    loadActivity();
    loadHealth();
  }, []);

  const urlScans = activities.filter(a => a.actionType === 'URL_SCAN').length;
  const fileScans = activities.filter(a => a.actionType === 'FILE_SCAN').length;
  const highRisk = activities.filter(a => a.result?.riskLevel?.toLowerCase() === 'high').length;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 8px rgba(0,255,136,0.8)' }} />
            <span className="font-mono text-xs text-cyber-muted tracking-widest">SYSTEM ONLINE</span>
            {serverStatus && (
              <span className="font-mono text-xs px-2 py-0.5 rounded ml-2"
                style={{
                  color: serverStatus === 'online' ? '#00ff88' : '#ff2d55',
                  background: serverStatus === 'online' ? 'rgba(0,255,136,0.1)' : 'rgba(255,45,85,0.1)',
                  border: `1px solid ${serverStatus === 'online' ? 'rgba(0,255,136,0.3)' : 'rgba(255,45,85,0.3)'}`,
                }}>
                SERVER {serverStatus.toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
            WELCOME BACK, <span className="text-cyber-accent" style={{ textShadow: '0 0 10px rgba(0,212,255,0.6)' }}>
              {user?.name?.split(' ')[0]?.toUpperCase() || 'AGENT'}
            </span>
          </h1>
          <p className="font-mono text-cyber-muted text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Globe} label="URL Scans" value={urlScans} color="#00d4ff" />
          <StatCard icon={FileText} label="File Scans" value={fileScans} color="#7b2fff" />
          <StatCard icon={AlertTriangle} label="High Risk" value={highRisk} color="#ff2d55" />
          <StatCard icon={Activity} label="Total Scans" value={activities.length} color="#00ff88" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Breach Monitor */}
          <BreachCard user={user} />

          {/* Recent Activity */}
          <div className="cyber-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-cyber-accent" />
                <h3 className="font-bold text-white text-sm tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
                  RECENT ACTIVITY
                </h3>
              </div>
              <Link to="/activity"
                className="flex items-center gap-1 font-mono text-xs text-cyber-accent hover:text-white transition-colors">
                VIEW ALL <ExternalLink size={11} />
              </Link>
            </div>

            {activityLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin mx-auto mb-3" />
                <p className="font-mono text-xs text-cyber-muted">LOADING ACTIVITY...</p>
              </div>
            ) : (
              <ActivityFeed activities={activities.slice(0, 5)} />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="cyber-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Search size={18} className="text-cyber-accent" />
            <h3 className="font-bold text-white text-sm tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
              QUICK SCAN
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Scan URL', desc: 'Check a URL for threats', color: '#00d4ff', to: '/scan?tab=url' },
              { label: 'Scan File', desc: 'Upload file for analysis', color: '#7b2fff', to: '/scan?tab=file' },
              { label: 'Domain Report', desc: 'Full domain security audit', color: '#00ff88', to: '/scan?tab=domain' },
              { label: 'IP Report', desc: 'IP address intelligence', color: '#ffd60a', to: '/scan?tab=ip' },
            ].map(({ label, desc, color, to }) => (
              <Link key={label} to={to}
                className="p-4 rounded text-left transition-all duration-300 hover:-translate-y-1 group"
                style={{ background: `${color}08`, border: `1px solid ${color}22` }}
                onMouseEnter={e => e.currentTarget.style.border = `1px solid ${color}66`}
                onMouseLeave={e => e.currentTarget.style.border = `1px solid ${color}22`}
              >
                <p className="font-bold text-xs mb-1 tracking-widest" style={{ color, fontFamily: 'Orbitron, monospace' }}>{label}</p>
                <p className="font-mono text-cyber-muted text-xs">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
