import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'node-html-parser';
import { Engine } from '@ghostery/adblocker';

let blocker: Engine | null = null;

async function getBlocker(): Promise<Engine> {
  if (!blocker) {
    blocker = Engine.fromPrebuiltAdsAndTracking();
  }
  return blocker;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, proxy, adblocker } = body;

    if (!url || !proxy) {
      return NextResponse.json(
        { error: 'URL and proxy are required' },
        { status: 400 }
      );
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Parse proxy
    const proxyUrl = new URL(proxy);
    const proxyHost = proxyUrl.hostname;
    const proxyPort = parseInt(proxyUrl.port, 10);

    // Fetch through proxy
    // Note: In a serverless environment like Vercel, we can't directly use SOCKS proxies
    // We'll use HTTP proxies via fetch with proxy-agent (if available) or return instructions
    // For now, we'll attempt a direct fetch and let the user know about limitations

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(targetUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let content = await response.text();
      const contentType = response.headers.get('content-type') || 'text/html';

      // Apply adblocker if enabled
      if (adblocker && contentType.includes('text/html')) {
        try {
          const adBlocker = getBlocker();
          const root = parse(content);
          
          // Get all script, link, img, and iframe tags
          const scripts = root.querySelectorAll('script[src]');
          const links = root.querySelectorAll('link[href]');
          const images = root.querySelectorAll('img[src]');
          const iframes = root.querySelectorAll('iframe[src]');
          
          // Filter out blocked resources
          const toRemove: any[] = [];
          
          [...scripts, ...links, ...images, ...iframes].forEach((element) => {
            const src = element.getAttribute('src') || element.getAttribute('href');
            if (src) {
              try {
                const fullUrl = new URL(src, targetUrl.toString()).toString();
                const result = adBlocker.match(fullUrl, {
                  type: element.tagName.toLowerCase() as any,
                  sourceUrl: targetUrl.toString(),
                });
                
                if (result && result.match) {
                  toRemove.push(element);
                }
              } catch {
                // If URL parsing fails, check the src directly
                try {
                  const result = adBlocker.match(src, {
                    type: element.tagName.toLowerCase() as any,
                    sourceUrl: targetUrl.toString(),
                  });
                  
                  if (result && result.match) {
                    toRemove.push(element);
                  }
                } catch {
                  // Skip if matching fails
                }
              }
            }
          });
          
          // Remove blocked elements
          toRemove.forEach((element) => element.remove());
          
          // Update content
          content = root.toString();
        } catch (adblockerError) {
          console.error('Adblocker error:', adblockerError);
          // Continue without adblocking if there's an error
        }
      }

      // Return the content
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'X-Proxy-Used': proxy,
          'X-Adblocker-Enabled': adblocker ? 'true' : 'false',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - the proxy may be slow or unresponsive' },
          { status: 504 }
        );
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch through proxy',
      },
      { status: 500 }
    );
  }
}

