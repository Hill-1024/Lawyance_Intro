import { readApkMirrorManifest } from './apkMirror';

export interface ReleaseInfo {
  tagName: string;
  htmlUrl: string;
  apkUrl: string;
  apkSize: string;
  publishedAt: string;
}

interface BackendReleaseInfo {
  versionName?: string;
  apkUrl?: string;
  size?: number;
  publishedAt?: string;
}

interface GitHubReleaseAsset {
  name: string;
  size?: number;
  browser_download_url?: string;
}

interface GitHubReleaseInfo {
  tag_name?: string;
  html_url?: string;
  published_at?: string;
  assets?: GitHubReleaseAsset[];
}

const appOrigin = 'https://law.mutsumi.moe';
const androidReleaseUrl = `${appOrigin}/api/releases/android/latest`;
const androidApkUrl = `${appOrigin}/api/releases/android/apk`;
const githubReleaseUrl = 'https://github.com/Hill-1024/Lawyance/releases/latest';
const githubReleaseApiUrl = 'https://api.github.com/repos/Hill-1024/Lawyance/releases/latest';
const requestTimeoutMs = 6000;

const fallback: ReleaseInfo = {
  tagName: '最新版',
  htmlUrl: githubReleaseUrl,
  apkUrl: androidApkUrl,
  apkSize: '最新版本',
  publishedAt: '',
};

const withTagPrefix = (versionName?: string) => {
  if (!versionName) return fallback.tagName;
  return versionName.startsWith('v') ? versionName : `v${versionName}`;
};

const formatSize = (size?: number) => {
  if (!Number.isFinite(size) || !size) return fallback.apkSize;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const normalizeApkUrl = (apkUrl?: string) => {
  if (!apkUrl) return androidApkUrl;

  try {
    return new URL(apkUrl, appOrigin).toString();
  } catch {
    return androidApkUrl;
  }
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json() as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchBackendRelease(): Promise<ReleaseInfo> {
  const data = await fetchJson<BackendReleaseInfo>(androidReleaseUrl);

  return {
    tagName: withTagPrefix(data.versionName),
    htmlUrl: githubReleaseUrl,
    apkUrl: normalizeApkUrl(data.apkUrl),
    apkSize: formatSize(data.size),
    publishedAt: data.publishedAt || fallback.publishedAt,
  };
}

async function fetchGitHubRelease(): Promise<ReleaseInfo> {
  const data = await fetchJson<GitHubReleaseInfo>(githubReleaseApiUrl, {
    headers: {
      'User-Agent': 'Astro-Build-Lawyance-Intro',
    },
  });
  const apkAsset = data.assets?.find((asset) => asset.name.endsWith('.apk'));

  return {
    tagName: data.tag_name || fallback.tagName,
    htmlUrl: data.html_url || githubReleaseUrl,
    apkUrl: apkAsset?.browser_download_url || androidApkUrl,
    apkSize: formatSize(apkAsset?.size),
    publishedAt: data.published_at || fallback.publishedAt,
  };
}

/**
 * The APK this deployment mirrored at build time. Preferred over the live APIs:
 * it is the same release they report, and it is already served from this origin.
 */
async function fetchMirroredRelease(): Promise<ReleaseInfo | null> {
  const manifest = await readApkMirrorManifest();
  if (!manifest?.apkPath) return null;

  return {
    tagName: manifest.tagName || withTagPrefix(manifest.versionName),
    htmlUrl: manifest.releaseUrl || githubReleaseUrl,
    // Relative first: a preview deployment then serves its own copy instead of
    // pointing at the production origin recorded in the manifest.
    apkUrl: manifest.apkPath || manifest.apkUrl || androidApkUrl,
    apkSize: formatSize(manifest.size),
    publishedAt: manifest.publishedAt || fallback.publishedAt,
  };
}

export async function fetchLatestRelease(): Promise<ReleaseInfo> {
  const mirrored = await fetchMirroredRelease();
  if (mirrored) return mirrored;

  try {
    return await fetchBackendRelease();
  } catch (error) {
    console.warn('[Release API] Failed to fetch backend Android release. Falling back to GitHub release metadata.', error);
  }

  try {
    return await fetchGitHubRelease();
  } catch (error) {
    console.error('[GitHub API] Error fetching latest release. Using backend APK fallback.', error);
  }

  return fallback;
}
