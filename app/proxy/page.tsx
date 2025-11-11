'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';

function ProxyContent() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const url = searchParams.get('url');
    const proxy = searchParams.get('proxy');
    const adblocker = searchParams.get('adblocker') === 'true';

    if (!url || !proxy) {
      setError('Missing URL or proxy parameter');
      setLoading(false);
      return;
    }

    fetchContent(url, proxy, adblocker);
  }, [searchParams]);

  const fetchContent = async (url: string, proxy: string, adblocker: boolean) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, proxy, adblocker }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch through proxy');
      }

      const data = await response.text();
      setContent(data);

      // Write content to iframe
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.document.open();
        iframeRef.current.contentWindow.document.write(data);
        iframeRef.current.contentWindow.document.close();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading through proxy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.close()} className="matte-button">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <iframe
        ref={iframeRef}
        className={styles.iframe}
        title="Proxied Content"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}

export default function ProxyPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <ProxyContent />
    </Suspense>
  );
}

