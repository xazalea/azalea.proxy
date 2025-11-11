'use client';

import { useState, useEffect } from 'react';
import ProxySelector from '@/components/ProxySelector';
import ProxyBrowser from '@/components/ProxyBrowser';
import styles from './page.module.css';

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

export default function Home() {
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [adblockerEnabled, setAdblockerEnabled] = useState(true);

  useEffect(() => {
    fetchProxies();
  }, []);

  const fetchProxies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proxies');
      const data = await response.json();
      if (data.proxies) {
        setProxies(data.proxies);
      }
    } catch (error) {
      console.error('Error fetching proxies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.titleAccent}>Azalea</span>
            <span className={styles.titleNumber}>11</span>
          </h1>
          <p className={styles.subtitle}>Modern Web Proxy</p>
        </header>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            <ProxySelector
              proxies={proxies}
              selectedProxy={selectedProxy}
              onSelectProxy={setSelectedProxy}
              loading={loading}
              onRefresh={fetchProxies}
            />
          </div>

          <div className={styles.browser}>
            <ProxyBrowser 
              selectedProxy={selectedProxy} 
              adblockerEnabled={adblockerEnabled}
              onAdblockerToggle={setAdblockerEnabled}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

