import { useState, useEffect } from 'react';
import { Activity, Globe, FileText, AlertTriangle, CheckCircle, Clock, Filter } from 'lucide-react';
import { getRecentActivity } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const RISK_CONFIG = {
  high: { color: '#ff2d55', label: 'HIGH' },
  medium: { color: '#ffd60a', label: 'MEDIUM' },
  low: { color: '#00ff88', label: 'LOW' },
};

function ActivityRow({ item, index }) {
  const isUrl = item.actionType === 'URL_SCAN';
  const riskLevel = item.result?.riskLevel?.toLowerCase();
  const riskCfg = RISK_CONFIG[riskLevel];

  return (
    <div
      className="flex items-center gap-4 p-4 rounded border transition-all duration-300 hover:-translate-y-0.5 animate-fadeIn"
      style={{
        background: 'rgba(0,212,255,0.02)',
        border: '1px solid #1a2a4a',
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2a4a'}
    >
      {/* Type Icon */}
      <div className="p-2.5 rounded shrink-0" style={{
        background: isUrl ? 'rgba(0,212,255,0.1)' : 'rgba(123,47,255,0.1)',
        border: `1px solid ${isUrl ? 'rgba(0,212,255,0.3)' : 'rgba(123,47,255,0.3)'}`,
      }}>
        {isUrl
          ? <Globe size={15} style={{ color: '#00d4ff' }} />
          : <FileText size={15} style={{ color: '#7b2fff' }} />}
      </div>

      {/* Input */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm text-white truncate">{item.input}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-mono text-xs px-2 py-0.5 rounded"
            style={{
              background: isUrl ? 'rgba(0,212,255,0.08)' : 'rgba(123,47,255,0.08)',
              color: isUrl ? '#00d4ff' : '#7b2fff',
              border: `1px solid ${isUrl ? 'rgba(0,212,255,0.2)' : 'rgba(123,47,255,0.2)'}`,
            }}>
            {isUrl ? 'URL' : 'FILE'}
          </span>
          {item.createdAt && (
            <span className="font-mono text-xs text-cyber-muted flex items-center gap-1">
              <Clock size={10} />
              {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      {/* Risk Score */}
      <div className="text-right shrink-0">
        {item.result ? (
          <>
            <div className="font-bold text-xl" style={{
              fontFamily: 'Orbitron, monospace',
              color: riskCfg?.color || '#a8b8d8',
              textShadow: riskCfg ? `0 0 10px ${riskCfg.color}66` : 'none',
            }}>
              {item.result.riskScore ?? '—'}
            </div>
            {riskCfg && (
              <div className="font-mono text-xs px-2 py-0.5 rounded mt-1 text-center"
                style={{
                  color: riskCfg.color,
                  background: `${riskCfg.color}15`,
                  border: `1px solid ${riskCfg.color}33`,
                }}>
                {riskCfg.label}
              </div>
            )}
          </>
        ) : (
          <span className="font-mono text-xs text-cyber-muted">NO DATA</span>
        )}
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getRecentActivity();
        setActivities(res.data?.activities || res.data?.data || res.data || []);
      } catch (err) {
        setError('Failed to load activity data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = activities.filter(a => {
    if (filter === 'url') return a.actionType === 'URL_SCAN';
    if (filter === 'file') return a.actionType === 'FILE_SCAN';
    if (filter === 'high') return a.result?.riskLevel?.toLowerCase() === 'high';
    return true;
  });

  const urlCount = activities.filter(a => a.actionType === 'URL_SCAN').length;
  const fileCount = activities.filter(a => a.actionType === 'FILE_SCAN').length;
  const highCount = activities.filter(a => a.result?.riskLevel?.toLowerCase() === 'high').length;

  const filters = [
    { id: 'all', label: `ALL (${activities.length})` },
    { id: 'url', label: `URL (${urlCount})` },
    { id: 'file', label: `FILE (${fileCount})` },
    { id: 'high', label: `HIGH RISK (${highCount})` },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity size={20} className="text-cyber-accent" />
            <h1 className="text-2xl font-bold text-white tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
              ACTIVITY LOG
            </h1>
          </div>
          <p className="font-mono text-cyber-muted text-sm">
            Complete history of all your security scans and threat analyses
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'URL Scans', value: urlCount, color: '#00d4ff' },
            { label: 'File Scans', value: fileCount, color: '#7b2fff' },
            { label: 'High Risk', value: highCount, color: '#ff2d55' },
          ].map(({ label, value, color }) => (
            <div key={label} className="cyber-card p-4 text-center">
              <div className="text-2xl font-bold mb-1" style={{ color, fontFamily: 'Orbitron, monospace', textShadow: `0 0 10px ${color}55` }}>
                {value}
              </div>
              <div className="font-mono text-xs text-cyber-muted tracking-wider uppercase">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <Filter size={14} className="text-cyber-muted self-center mr-1" />
          {filters.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className="px-3 py-1.5 font-mono text-xs rounded border transition-all duration-300"
              style={{
                color: filter === id ? '#00d4ff' : '#4a5568',
                borderColor: filter === id ? '#00d4ff' : '#1a2a4a',
                background: filter === id ? 'rgba(0,212,255,0.08)' : 'transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="cyber-card p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-2 border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-mono text-cyber-muted text-xs tracking-widest">LOADING ACTIVITY LOG...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle size={40} className="mx-auto mb-4 text-cyber-red opacity-60" />
              <p className="font-mono text-cyber-red text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto mb-4 text-cyber-muted opacity-30" />
              <p className="font-mono text-cyber-muted text-sm tracking-widest">NO ACTIVITY FOUND</p>
              <p className="font-mono text-cyber-muted text-xs mt-2 opacity-70">
                {filter !== 'all' ? 'Try changing the filter.' : 'Start scanning to see your history here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item, i) => (
                <ActivityRow key={item._id || i} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
