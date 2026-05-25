import { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Globe, FileUp, Server, Wifi, Search, Upload,
  AlertTriangle, Shield
} from 'lucide-react';

import {
  scanUrl,
  scanFile,
  getDomainReport,
  getIpReport
} from '../api/services';

import AppLayout from '../components/layout/AppLayout';

// ─────────────────────────────────────────────
// 🔹 TABS
// ─────────────────────────────────────────────
const TABS = [
  { id: 'url', label: 'URL', icon: Globe },
  { id: 'file', label: 'FILE', icon: FileUp },
  { id: 'domain', label: 'DOMAIN', icon: Server },
  { id: 'ip', label: 'IP', icon: Wifi },
];

// ─────────────────────────────────────────────
// 🔹 RISK BADGE
// ─────────────────────────────────────────────
function RiskBadge({ score, level }) {
  const getColor = () => {
    if (!level) return '#aaa';
    if (level === 'HIGH') return '#ff2d55';
    if (level === 'MEDIUM') return '#ffd60a';
    return '#00ff88';
  };

  const color = getColor();

  return (
    <div style={{ border: `1px solid ${color}`, padding: 16 }}>
      <h2 style={{ color }}>Risk Score: {score}</h2>
      <h3 style={{ color }}>{level}</h3>
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 RESULT PANEL
// ─────────────────────────────────────────────
function ResultPanel({ result }) {
  if (!result) return null;

  const raw = result;

  return (
    <div style={{ marginTop: 20 }}>

      {/* Risk */}
      {(raw?.riskScore !== undefined) && (
        <RiskBadge score={raw.riskScore} level={raw.riskLevel} />
      )}

      {/* Verdict */}
      {raw?.riskLevel && (
        <div style={{ marginTop: 10 }}>
          {raw.riskLevel === "HIGH" && <p style={{ color: 'red' }}>🚨 Dangerous</p>}
          {raw.riskLevel === "MEDIUM" && <p style={{ color: 'orange' }}>⚠️ Suspicious</p>}
          {raw.riskLevel === "LOW" && <p style={{ color: 'green' }}>✅ Safe</p>}
        </div>
      )}

      {/* Stats */}
      {raw?.stats && (
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          {Object.entries(raw.stats).map(([key, val]) => (
            <div key={key}>
              <h4>{key}</h4>
              <p>{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* File Stats */}
      {(raw?.maliciousCount !== undefined) && (
        <div style={{ marginTop: 20 }}>
          <p>Malicious: {raw.maliciousCount}</p>
          <p>Harmless: {raw.harmlessCount}</p>
        </div>
      )}

      {/* Threats */}
      {raw?.topThreats?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h4>Threats Detected:</h4>
          {raw.topThreats.map((t, i) => (
            <p key={i}>{t.engine} → {t.result}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 URL SCANNER
// ─────────────────────────────────────────────
function UrlScanner() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    const res = await scanUrl(url);
    setResult(res.data.data); // IMPORTANT
  };

  return (
    <div>
      <input value={url} onChange={(e) => setUrl(e.target.value)} />
      <button onClick={handleScan}>Scan URL</button>

      <ResultPanel result={result} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 FILE SCANNER
// ─────────────────────────────────────────────
function FileScanner() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    const res = await scanFile(file);
    setResult(res.data.data); // IMPORTANT
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleScan}>Scan File</button>

      <ResultPanel result={result} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 DOMAIN SCANNER
// ─────────────────────────────────────────────
function DomainScanner() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    const res = await getDomainReport(domain);
    setResult(res.data);
  };

  return (
    <div>
      <input value={domain} onChange={(e) => setDomain(e.target.value)} />
      <button onClick={handleScan}>Scan Domain</button>

      <ResultPanel result={result} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 IP SCANNER
// ─────────────────────────────────────────────
function IpScanner() {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);

  const handleScan = async () => {
    const res = await getIpReport(ip);
    setResult(res.data);
  };

  return (
    <div>
      <input value={ip} onChange={(e) => setIp(e.target.value)} />
      <button onClick={handleScan}>Scan IP</button>

      <ResultPanel result={result} />
    </div>
  );
}

// ─────────────────────────────────────────────
// 🔹 MAIN PAGE
// ─────────────────────────────────────────────
export default function ScanPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'url';

  const panels = {
    url: <UrlScanner />,
    file: <FileScanner />,
    domain: <DomainScanner />,
    ip: <IpScanner />
  };

  return (
    <AppLayout>
      <div style={{ padding: 20 }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setParams({ tab: t.id })}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div style={{ marginTop: 20 }}>
          {panels[tab]}
        </div>

      </div>
    </AppLayout>
  );
}