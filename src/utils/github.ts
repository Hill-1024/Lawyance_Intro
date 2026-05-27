export interface ReleaseInfo {
  tagName: string;
  htmlUrl: string;
  apkUrl: string;
  apkSize: string;
  publishedAt: string;
}

export async function fetchLatestRelease(): Promise<ReleaseInfo> {
  const fallback: ReleaseInfo = {
    tagName: 'v1.1.2',
    htmlUrl: 'https://github.com/Hill-1024/Lawyance/releases',
    apkUrl: 'https://github.com/Hill-1024/Lawyance/releases/download/v1.1.2/Lawyance-1.1.2.apk',
    apkSize: '45.8 MB',
    publishedAt: '2026-05-27T08:00:00Z',
  };

  try {
    // Timeout-enabled fetch for resilience
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://api.github.com/repos/Hill-1024/Lawyance/releases/latest', {
      headers: {
        'User-Agent': 'Astro-Build-Lawyance-Intro',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[GitHub API] Failed to fetch latest release: ${response.status}. Using local fallback.`);
      return fallback;
    }

    const data = await response.json();
    const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith('.apk'));
    
    let apkSizeStr = fallback.apkSize;
    if (apkAsset && apkAsset.size) {
      apkSizeStr = `${(apkAsset.size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return {
      tagName: data.tag_name || fallback.tagName,
      htmlUrl: data.html_url || fallback.htmlUrl,
      apkUrl: apkAsset ? apkAsset.browser_download_url : fallback.apkUrl,
      apkSize: apkSizeStr,
      publishedAt: data.published_at || fallback.publishedAt,
    };
  } catch (error) {
    console.error('[GitHub API] Error fetching latest release. Using local fallback.', error);
    return fallback;
  }
}
