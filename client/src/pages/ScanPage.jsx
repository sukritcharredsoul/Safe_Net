import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Globe, FileUp, Server, Wifi, Search, Upload,
  AlertTriangle, Shield
} from 'lucide-react';
import { scanUrl, scanFile, getDomainReport, getIpReport } from '../api/services';
import AppLayout from '../components/layout/AppLayout';

const TABS = [
  { id: 'url',    label: 'URL',        icon: Globe,  color: '#00d4ff' },
  { id: 'file',   label: 'FILE',       icon: FileUp, color: '#7b2fff' },
  { id: 'domain', label: 'DOMAIN',     icon: Server, color: '#00ff88' },
  { id: 'ip',     label: 'IP ADDRESS', icon: Wifi,   color: '#ffd60a' },
];

// ─────────────────────────────────────────────
// 🔹 RISK RING
// ─────────────────────────────────────────────
function RiskRing({ score, color }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={r}
          fill="none" stroke={color}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 18, fontWeight: 500, color, fontFamily: 'Orbitron,monospace' }}>{score}</span>
        <span style={{ fontSize: 10, color: '#a8b8d8' }}>/100</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 SCAN RESULT CARD
// ─────────────────────────────────────────────
const LEVEL_CONFIG = {
  HIGH:   { color: '#ff2d55', bg: 'rgba(255,45,85,0.08)',  border: 'rgba(255,45,85,0.3)',  label: 'High risk' },
  MEDIUM: { color: '#ffd60a', bg: 'rgba(255,214,10,0.08)', border: 'rgba(255,214,10,0.3)', label: 'Medium risk' },
  LOW:    { color: '#00ff88', bg: 'rgba(0,255,136,0.08)',  border: 'rgba(0,255,136,0.3)',  label: 'Low risk' },
};

function ScanResultCard({ result }) {
  if (!result) return null;

  const raw = result?.data || result;
  const {
    riskScore, riskLevel,
    maliciousCount, harmlessCount, totalEngines,
    stats, topThreats,
    scanStatus, fileHash, scanId,
    url, domain, ip, reputation,
  } = raw;

  const cfg = LEVEL_CONFIG[riskLevel?.toUpperCase()] || LEVEL_CONFIG.LOW;

  // Build stat entries — prefer live `stats` object (URL scan),
  // fall back to stored counts (file scan from DB)
  const statEntries = stats
    ? Object.entries(stats).map(([k, v]) => ({ key: k, val: v }))
    : [
        { key: 'malicious',  val: maliciousCount ?? 0 },
        { key: 'harmless',   val: harmlessCount  ?? 0 },
        { key: 'total',      val: totalEngines   ?? 0 },
      ];

  const statColor = (key) => {
    if (key === 'malicious')  return '#ff2d55';
    if (key === 'suspicious') return '#ffd60a';
    if (key === 'harmless')   return '#00ff88';
    return '#a8b8d8';
  };

  const metaRows = [
    url        && ['URL',     url],
    domain     && ['Domain',  domain],
    ip         && ['IP',      ip],
    fileHash   && ['SHA-256', `${fileHash.slice(0, 8)}…${fileHash.slice(-6)}`],
    scanStatus && ['Status',  scanStatus],
    scanId     && ['Scan ID', `${scanId.slice(0, 10)}…`],
  ].filter(Boolean);

  return (
    <div className="mt-6 space-y-4 animate-fadeIn">

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent" style={{ boxShadow: '0 0 6px rgba(0,212,255,0.8)' }} />
        <h3 className="font-bold text-white text-xs tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
          SCAN RESULTS
        </h3>
      </div>

      {/* ── Risk hero (file / URL scans) ── */}
      {riskScore !== undefined && (
        <div className="flex items-center gap-5 p-4 rounded-lg"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          <RiskRing score={riskScore} color={cfg.color} />
          <div>
            <div className="font-bold tracking-widest text-sm mb-1"
              style={{ color: cfg.color, fontFamily: 'Orbitron, monospace' }}>
              {cfg.label.toUpperCase()}
            </div>
            <div className="font-mono text-xs text-cyber-muted">
              {maliciousCount ?? stats?.malicious ?? 0} of{' '}
              {totalEngines ?? Object.values(stats || {}).reduce((a, b) => a + b, 0)} engines flagged this
            </div>
          </div>
        </div>
      )}

      {/* ── Reputation hero (domain / IP) ── */}
      {reputation !== undefined && riskScore === undefined && (() => {
        const isPositive = reputation >= 0;
        const repColor   = isPositive ? '#00ff88' : '#ff2d55';
        const repBg      = isPositive ? 'rgba(0,255,136,0.08)' : 'rgba(255,45,85,0.08)';
        const repBorder  = isPositive ? 'rgba(0,255,136,0.3)'  : 'rgba(255,45,85,0.3)';
        const repLabel   = isPositive ? 'Trusted'              : 'Suspicious';
        return (
          <div className="flex items-center gap-5 p-4 rounded-lg"
            style={{ background: repBg, border: `1px solid ${repBorder}` }}>
            <div style={{ textAlign: 'center', minWidth: 64 }}>
              <div style={{ fontSize: 28, fontWeight: 500, color: repColor, fontFamily: 'Orbitron,monospace', lineHeight: 1 }}>
                {reputation > 0 ? `+${reputation}` : reputation}
              </div>
              <div style={{ fontSize: 10, color: '#a8b8d8', marginTop: 2 }}>REPUTATION</div>
            </div>
            <div className="h-10 w-px" style={{ background: `${repColor}30` }} />
            <div>
              <div className="font-bold tracking-widest text-sm mb-1"
                style={{ color: repColor, fontFamily: 'Orbitron, monospace' }}>
                {repLabel.toUpperCase()}
              </div>
              <div className="font-mono text-xs text-cyber-muted">
                Community reputation score
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Engine breakdown grid ── */}
      {statEntries.length > 0 && (
        <div>
          <p className="font-mono text-xs text-cyber-muted tracking-widest mb-2">ENGINE BREAKDOWN</p>
          <div className="grid grid-cols-3 gap-3">
            {statEntries.map(({ key, val }) => (
              <div key={key} className="p-3 rounded text-center"
                style={{ background: '#0a1628', border: '1px solid #1a2a4a' }}>
                <div className="text-2xl font-bold mb-1"
                  style={{ color: statColor(key), fontFamily: 'Orbitron,monospace' }}>
                  {val}
                </div>
                <div className="font-mono text-xs capitalize" style={{ color: statColor(key) }}>
                  {key}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top detections ── */}
      {topThreats?.length > 0 && (
        <div>
          <p className="font-mono text-xs text-cyber-muted tracking-widest mb-2">TOP DETECTIONS</p>
          <div className="space-y-2">
            {topThreats.map(({ engine, result: res, category }) => {
              const isSuspicious = category === 'suspicious';
              const dotColor = isSuspicious ? '#ffd60a' : '#ff2d55';
              const rowBg    = isSuspicious ? 'rgba(255,214,10,0.06)' : 'rgba(255,45,85,0.06)';
              const rowBorder = isSuspicious ? 'rgba(255,214,10,0.15)' : 'rgba(255,45,85,0.15)';
              return (
                <div key={engine} className="flex items-center gap-3 px-3 py-2 rounded"
                  style={{ background: rowBg, border: `1px solid ${rowBorder}` }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                  <span className="font-mono text-xs text-white font-bold flex-1">{engine}</span>
                  <span className="font-mono text-xs" style={{ color: dotColor }}>{res}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── No threats state ── */}
      {Array.isArray(topThreats) && topThreats.length === 0 && (
        <div className="text-center py-4 rounded border border-cyber-green/20 bg-cyber-green/5">
          <p className="font-mono text-xs text-cyber-green tracking-widest">✓ NO THREATS DETECTED</p>
        </div>
      )}

      {/* ── Metadata footer ── */}
      {metaRows.length > 0 && (
        <div className="p-3 rounded space-y-2" style={{ background: '#080d1a', border: '1px solid #1a2a4a' }}>
          {metaRows.map(([k, v]) => (
            <div key={k} className="flex justify-between items-center font-mono text-xs">
              <span className="text-cyber-muted">{k}</span>
              <span className="text-cyber-accent break-all text-right ml-4">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 SCANNER PANELS
// ─────────────────────────────────────────────
function UrlScanner() {
  const [url, setUrl]       = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState('');

  const handleScan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await scanUrl(url.trim());
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-cyber-muted text-xs mb-5 leading-relaxed">
        Submit any URL to scan for malware, phishing, and other threats using multi-engine analysis.
      </p>
      <div className="flex gap-3">
        <input
          type="url"
          className="cyber-input flex-1"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
        <button onClick={handleScan} disabled={loading || !url.trim()} className="cyber-btn cyber-btn-primary shrink-0">
          {loading
            ? <span className="w-4 h-4 border-2 border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin" />
            : <Search size={16} />}
          {loading ? 'SCANNING' : 'SCAN'}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && (
        <div className="mt-6 text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-cyber-accent/20 rounded-full" />
            <div className="absolute inset-0 border-2 border-transparent border-t-cyber-accent rounded-full animate-spin" />
            <Globe size={20} className="absolute inset-0 m-auto text-cyber-accent" />
          </div>
          <p className="font-mono text-cyber-muted text-xs tracking-widest">ANALYZING URL THREAT VECTORS...</p>
        </div>
      )}

      {result && <ScanResultCard result={result} />}
    </div>
  );
}

function FileScanner() {
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [drag, setDrag]       = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => { setFile(f); setResult(null); setError(''); };
  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await scanFile(file);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-cyber-muted text-xs mb-5 leading-relaxed">
        Upload any file for multi-engine threat detection. Executables, documents, archives and more.
      </p>

      <div
        className="rounded border-2 border-dashed transition-all duration-300 cursor-pointer text-center p-8 mb-4"
        style={{
          borderColor: drag ? '#7b2fff' : file ? '#00d4ff55' : '#1a2a4a',
          background:  drag ? 'rgba(123,47,255,0.05)' : file ? 'rgba(0,212,255,0.03)' : 'transparent',
        }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        <Upload size={32} className="mx-auto mb-3" style={{ color: file ? '#00d4ff' : '#4a5568' }} />
        {file ? (
          <>
            <p className="font-mono text-cyber-accent text-sm font-bold">{file.name}</p>
            <p className="font-mono text-cyber-muted text-xs mt-1">
              {(file.size / 1024).toFixed(1)} KB — Click to change
            </p>
          </>
        ) : (
          <>
            <p className="font-mono text-white text-sm mb-1">DROP FILE HERE</p>
            <p className="font-mono text-cyber-muted text-xs">or click to browse</p>
          </>
        )}
      </div>

      {file && (
        <button onClick={handleScan} disabled={loading} className="cyber-btn cyber-btn-primary w-full justify-center">
          {loading ? (
            <span className="flex items-center gap-3">
              <span className="w-4 h-4 border-2 border-cyber-accent/30 border-t-cyber-accent rounded-full animate-spin" />
              ANALYZING FILE...
            </span>
          ) : (
            <><Shield size={14} /> SCAN FILE</>
          )}
        </button>
      )}

      {error && <ErrorBanner message={error} />}
      {result && <ScanResultCard result={result} />}
    </div>
  );
}

function DomainScanner() {
  const [domain, setDomain]   = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  const handleScan = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await getDomainReport(domain.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch domain report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-cyber-muted text-xs mb-5 leading-relaxed">
        Get a comprehensive security report for any domain including reputation, DNS records, and threat intelligence.
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          className="cyber-input flex-1"
          placeholder="google.com"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
        <button onClick={handleScan} disabled={loading || !domain.trim()} className="cyber-btn cyber-btn-green shrink-0">
          {loading
            ? <span className="w-4 h-4 border-2 border-cyber-green/30 border-t-cyber-green rounded-full animate-spin" />
            : <Server size={16} />}
          {loading ? 'CHECKING' : 'ANALYZE'}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && (
        <div className="mt-6 text-center">
          <div className="w-8 h-8 border-2 border-cyber-green/30 border-t-cyber-green rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-cyber-muted text-xs tracking-widest">QUERYING DOMAIN INTELLIGENCE...</p>
        </div>
      )}

      {result && <ScanResultCard result={result} />}
    </div>
  );
}

function IpScanner() {
  const [ip, setIp]           = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  const handleScan = async () => {
    if (!ip.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await getIpReport(ip.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch IP report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-cyber-muted text-xs mb-5 leading-relaxed">
        Look up reputation, geolocation, and threat intelligence for any IPv4 or IPv6 address.
      </p>
      <div className="flex gap-3">
        <input
          type="text"
          className="cyber-input flex-1"
          placeholder="8.8.8.8"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
        />
        <button
          onClick={handleScan}
          disabled={loading || !ip.trim()}
          className="cyber-btn shrink-0"
          style={{ background: 'rgba(255,214,10,0.08)', borderColor: '#ffd60a', color: '#ffd60a' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ffd60a'; e.currentTarget.style.color = '#050810'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,214,10,0.08)'; e.currentTarget.style.color = '#ffd60a'; }}
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
            : <Wifi size={16} />}
          {loading ? 'CHECKING' : 'LOOKUP'}
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && (
        <div className="mt-6 text-center">
          <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-cyber-muted text-xs tracking-widest">FETCHING IP INTELLIGENCE...</p>
        </div>
      )}

      {result && <ScanResultCard result={result} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 SHARED ERROR BANNER
// ─────────────────────────────────────────────
function ErrorBanner({ message }) {
  return (
    <div className="mt-4 flex items-center gap-3 p-3 rounded border border-cyber-red/30 bg-cyber-red/5 text-cyber-red font-mono text-xs">
      <AlertTriangle size={14} /> {message}
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 PAGE
// ─────────────────────────────────────────────
export default function ScanPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'url';
  const setTab = (id) => setSearchParams({ tab: id });

  const panels = { url: UrlScanner, file: FileScanner, domain: DomainScanner, ip: IpScanner };
  const ActivePanel  = panels[activeTab] || UrlScanner;
  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-widest mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
            THREAT SCANNER
          </h1>
          <p className="font-mono text-cyber-muted text-sm">
            Multi-vector threat analysis powered by real-time intelligence
          </p>
        </div>

        <div className="cyber-card overflow-visible">

          {/* Tab Bar */}
          <div className="flex border-b border-cyber-border overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon, color }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="flex items-center gap-2 px-5 py-4 font-mono text-xs tracking-widest uppercase transition-all duration-300 whitespace-nowrap shrink-0"
                  style={{
                    color:        active ? color : '#4a5568',
                    borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
                    background:   active ? `${color}08` : 'transparent',
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Panel */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              {activeTabData && (
                <>
                  <div className="p-2 rounded" style={{ background: `${activeTabData.color}15`, border: `1px solid ${activeTabData.color}33` }}>
                    <activeTabData.icon size={16} style={{ color: activeTabData.color }} />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-sm tracking-widest" style={{ fontFamily: 'Orbitron, monospace' }}>
                      {activeTabData.label} SCANNER
                    </h2>
                    <div className="h-px mt-1 w-16" style={{ background: activeTabData.color }} />
                  </div>
                </>
              )}
            </div>
            <ActivePanel />
          </div>

        </div>
      </div>
    </AppLayout>
  );
}