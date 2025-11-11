'use client';

import { useState, FormEvent } from 'react';
import styles from './ProxyBrowser.module.css';

interface Proxy {
  ip: string;
  port: number;
  protocol: string;
  proxy: string;
}

interface ProxyBrowserProps {
  selectedProxy: Proxy | null;
  adblockerEnabled: boolean;
  onAdblockerToggle: (enabled: boolean) => void;
}

export default function ProxyBrowser({ 
  selectedProxy, 
  adblockerEnabled, 
  onAdblockerToggle 
}: ProxyBrowserProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedProxy) {
      setError('Please select a proxy server first');
      return;
    }

    if (!url) {
      setError('Please enter a URL');
      return;
    }

    // Validate URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          proxy: selectedProxy.proxy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch through proxy');
      }

      // Redirect to proxy page route
      const encodedUrl = encodeURIComponent(targetUrl);
      const encodedProxy = encodeURIComponent(selectedProxy.proxy);
      const adblockerParam = adblockerEnabled ? '&adblocker=true' : '';
      window.open(`/proxy?url=${encodedUrl}&proxy=${encodedProxy}${adblockerParam}`, '_blank');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.browser}>
      <div className={styles.browserHeader}>
        <h2 className={styles.title}>Browse</h2>
        {selectedProxy && (
          <div className={styles.proxyInfo}>
            <span className={styles.proxyLabel}>Using:</span>
            <span className={styles.proxyValue}>
              {selectedProxy.ip}:{selectedProxy.port}
            </span>
          </div>
        )}
      </div>

      {!selectedProxy && (
        <div className={styles.noProxy}>
          <p>Please select a proxy server from the sidebar to start browsing.</p>
        </div>
      )}

      {selectedProxy && (
        <>
          <div className={styles.settings}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={adblockerEnabled}
                onChange={(e) => onAdblockerToggle(e.target.checked)}
                className={styles.toggleInput}
              />
              <span className={styles.toggleText}>
                <span className={styles.toggleIcon}>🛡️</span>
                Block ads and trackers
              </span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className={styles.urlForm}>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL (e.g., example.com)"
                className="matte-input"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !url}
                className="matte-button"
              >
                {loading ? 'Loading...' : 'Go'}
              </button>
            </div>
          </form>

          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.info}>
            <h3 className={styles.infoTitle}>How to use:</h3>
            <ol className={styles.infoList}>
              <li>Select a proxy server from the sidebar</li>
              <li>Toggle ad blocker on/off as needed</li>
              <li>Enter the URL you want to visit</li>
              <li>Click "Go" to browse through the selected proxy</li>
              <li>The page will open in a new window</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}

