'use client';

import { useState } from 'react';
import styles from './ProxySelector.module.css';

interface Proxy {
  ip: string;
  port: number;
  protocol: string;
  country?: string;
  anonymity?: string;
  uptime?: number;
  timeout?: number;
  proxy: string;
}

interface ProxySelectorProps {
  proxies: Proxy[];
  selectedProxy: Proxy | null;
  onSelectProxy: (proxy: Proxy) => void;
  loading: boolean;
  onRefresh: () => void;
}

export default function ProxySelector({
  proxies,
  selectedProxy,
  onSelectProxy,
  loading,
  onRefresh,
}: ProxySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');

  const countries = Array.from(
    new Set(
      proxies
        .map((p) => p.country)
        .filter((c): c is string => Boolean(c))
    )
  ).sort();

  const filteredProxies = proxies.filter((proxy) => {
    const matchesSearch =
      proxy.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proxy.port.toString().includes(searchTerm);
    const matchesCountry = !filterCountry || proxy.country === filterCountry;
    return matchesSearch && matchesCountry;
  });

  const getUptimeColor = (uptime?: number) => {
    if (!uptime) return 'var(--sage-gray)';
    if (uptime >= 95) return '#4CAF50';
    if (uptime >= 80) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className={styles.selector}>
      <div className={styles.header}>
        <h2 className={styles.title}>Proxy Servers</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className={styles.refreshButton}
          title="Refresh proxies"
        >
          {loading ? '⟳' : '↻'}
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search IP or port..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="matte-input"
        />
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="matte-input"
        >
          <option value="">All Countries</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.stats}>
        <span className={styles.stat}>
          {filteredProxies.length} available
        </span>
        {selectedProxy && (
          <span className={styles.statActive}>1 active</span>
        )}
      </div>

      <div className={styles.proxyList}>
        {loading ? (
          <div className={styles.loading}>Loading proxies...</div>
        ) : filteredProxies.length === 0 ? (
          <div className={styles.empty}>No proxies found</div>
        ) : (
          filteredProxies.slice(0, 50).map((proxy) => (
            <div
              key={`${proxy.ip}:${proxy.port}`}
              className={`${styles.proxyItem} ${
                selectedProxy?.ip === proxy.ip &&
                selectedProxy?.port === proxy.port
                  ? styles.proxyItemActive
                  : ''
              }`}
              onClick={() => onSelectProxy(proxy)}
            >
              <div className={styles.proxyHeader}>
                <span className={styles.proxyIp}>{proxy.ip}</span>
                <span className={styles.proxyPort}>:{proxy.port}</span>
                <span className={styles.proxyProtocol}>{proxy.protocol}</span>
              </div>
              <div className={styles.proxyDetails}>
                {proxy.country && (
                  <span className={styles.proxyCountry}>{proxy.country}</span>
                )}
                {proxy.anonymity && (
                  <span className={styles.proxyAnonymity}>
                    {proxy.anonymity}
                  </span>
                )}
                {proxy.uptime !== undefined && (
                  <span
                    className={styles.proxyUptime}
                    style={{ color: getUptimeColor(proxy.uptime) }}
                  >
                    {proxy.uptime.toFixed(1)}% uptime
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

