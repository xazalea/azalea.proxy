import { NextResponse } from 'next/server';

interface ProxyResponse {
  proxies: Array<{
    ip: string;
    port: number;
    protocol: string;
    country?: string;
    anonymity?: string;
    uptime?: number;
    timeout?: number;
    proxy: string;
    ip_data?: {
      country?: string;
    };
  }>;
}

export async function GET() {
  try {
    const response = await fetch(
      'https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=json',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch proxies');
    }

    const data: ProxyResponse = await response.json();

    // Transform the data to our format
    const proxies = data.proxies
      .filter((p) => p.alive !== false) // Only alive proxies
      .map((proxy) => ({
        ip: proxy.ip,
        port: proxy.port,
        protocol: proxy.protocol.toLowerCase(),
        country: proxy.ip_data?.country || proxy.country || 'Unknown',
        anonymity: proxy.anonymity || 'unknown',
        uptime: proxy.uptime,
        timeout: proxy.timeout,
        proxy: proxy.proxy,
      }))
      .sort((a, b) => {
        // Sort by uptime (highest first), then by timeout (lowest first)
        if (a.uptime !== undefined && b.uptime !== undefined) {
          if (b.uptime !== a.uptime) {
            return b.uptime - a.uptime;
          }
        }
        if (a.timeout !== undefined && b.timeout !== undefined) {
          return a.timeout - b.timeout;
        }
        return 0;
      });

    return NextResponse.json({ proxies });
  } catch (error) {
    console.error('Error fetching proxies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proxies', proxies: [] },
      { status: 500 }
    );
  }
}

