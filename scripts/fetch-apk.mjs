#!/usr/bin/env node
/**
 * Mirror the newest upstream Android APK into `public/apk/` so the introduction
 * site serves the installer itself. GitHub release downloads are unreliable for
 * users on mainland-China networks, and the CDN in front of this site is not.
 *
 * The mirror is best effort. A failure only warns: the build keeps going and the
 * download button falls back to the external release link, so a flaky GitHub API
 * never blocks a deploy.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const outputDir = join(projectRoot, 'public', 'apk');
const manifestPath = join(outputDir, 'version.json');

const upstreamRepo = process.env.LAWVER_UPSTREAM_REPO || 'Hill-1024/Lawyance';
const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const requestTimeoutMs = 30_000;
const maxAttempts = 3;
const minimalApkBytes = 64 * 1024;

const log = (message) => console.log(`[apk-mirror] ${message}`);
const warn = (message) => console.warn(`[apk-mirror] ${message}`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch `url` and hand the response to `parse`, retrying transient failures.
 * Parsing happens inside the timeout window so a stalled body read also aborts.
 */
async function request(url, parse, init = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const response = await fetch(url, { ...init, redirect: 'follow', signal: controller.signal });

      if (!response.ok) {
        const error = new Error(`GET ${url} responded ${response.status}`);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }

      return await parse(response);
    } catch (error) {
      lastError = error;
      if (error?.retryable === false || attempt === maxAttempts) break;
      warn(`${error?.message || error} (attempt ${attempt}/${maxAttempts})`);
      await sleep(attempt * 1000);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

/** Read the latest upstream GitHub release and locate its Android artifacts. */
async function resolveRelease() {
  const release = await request(
    `https://api.github.com/repos/${upstreamRepo}/releases/latest`,
    (response) => response.json(),
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'lawver-intro-apk-mirror',
        ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
      },
    },
  );

  const assets = Array.isArray(release.assets) ? release.assets : [];
  const apkAsset = assets.find((asset) => typeof asset?.name === 'string' && asset.name.endsWith('.apk'));

  if (!apkAsset?.browser_download_url) {
    throw new Error(`release ${release.tag_name || '<unknown>'} carries no .apk asset`);
  }

  // `android-version.json` is the release's own manifest and carries the hash we
  // verify against. It is optional: an older release may predate it.
  const versionAsset = assets.find((asset) => asset?.name === 'android-version.json');
  let versionInfo = null;

  if (versionAsset?.browser_download_url) {
    try {
      versionInfo = await request(versionAsset.browser_download_url, (response) => response.json());
    } catch (error) {
      warn(`could not read android-version.json: ${error?.message || error}`);
    }
  }

  const versionName = String(versionInfo?.versionName || '').trim()
    || String(release.tag_name || '').replace(/^v/, '').trim();

  if (!versionName) {
    throw new Error('could not determine the release version');
  }

  return {
    versionName,
    versionCode: Number.isFinite(versionInfo?.versionCode) ? versionInfo.versionCode : undefined,
    tagName: release.tag_name || `v${versionName}`,
    publishedAt: versionInfo?.publishedAt || release.published_at || '',
    sha256: typeof versionInfo?.sha256 === 'string' ? versionInfo.sha256.toLowerCase() : '',
    downloadUrl: apkAsset.browser_download_url,
    releaseUrl: release.html_url || `https://github.com/${upstreamRepo}/releases/latest`,
  };
}

/** Reuse an APK from an earlier build when it is provably the same artifact. */
async function readReusableApk(fileName, release) {
  if (!release.sha256) return null;

  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const info = await stat(join(outputDir, fileName));
    const sameArtifact = manifest?.apkPath === `/apk/${fileName}`
      && manifest?.versionName === release.versionName
      && manifest?.sha256 === release.sha256
      && manifest?.size === info.size;

    return sameArtifact ? { size: info.size, sha256: release.sha256 } : null;
  } catch {
    return null;
  }
}

/** Download the APK, sanity-check the payload, and verify it against the release hash. */
async function downloadApk(release) {
  const buffer = Buffer.from(await request(release.downloadUrl, (response) => response.arrayBuffer()));

  if (buffer.length < minimalApkBytes) {
    throw new Error(`downloaded payload is only ${buffer.length} bytes`);
  }

  // An APK is a ZIP container. This catches the common case of a proxy or an
  // error page being served in place of the binary.
  if (buffer.subarray(0, 4).toString('binary') !== 'PK\x03\x04') {
    throw new Error('downloaded payload is not a ZIP/APK container');
  }

  const sha256 = createHash('sha256').update(buffer).digest('hex');

  if (release.sha256 && sha256 !== release.sha256) {
    throw new Error(`sha256 mismatch (release ${release.sha256}, downloaded ${sha256})`);
  }

  return { buffer, sha256 };
}

/** Drop superseded APKs so builds do not accumulate installers in the deploy. */
async function pruneApks(keep) {
  const entries = await readdir(outputDir).catch(() => []);
  await Promise.all(entries
    .filter((entry) => entry !== keep && (entry.endsWith('.apk') || entry.endsWith('.tmp')))
    .map((entry) => rm(join(outputDir, entry), { force: true })));
}

/** `astro.config.mjs` owns the public domain, so take the origin from there. */
async function resolveSiteOrigin() {
  if (process.env.LAWVER_SITE_ORIGIN) {
    return process.env.LAWVER_SITE_ORIGIN.replace(/\/+$/, '');
  }

  try {
    const { default: config } = await import(pathToFileURL(join(projectRoot, 'astro.config.mjs')).href);
    return String(config?.site || '').replace(/\/+$/, '');
  } catch (error) {
    warn(`could not read the site origin from astro.config.mjs: ${error?.message || error}`);
    return '';
  }
}

async function mirror() {
  const release = await resolveRelease();
  await mkdir(outputDir, { recursive: true });

  const fileName = `Lawver-${release.versionName.replace(/[^0-9A-Za-z._-]/g, '')}.apk`;
  const apkPath = `/apk/${fileName}`;

  const reusable = await readReusableApk(fileName, release);
  let artifact;

  if (reusable) {
    log(`${fileName} already matches ${release.tagName}; reusing it`);
    artifact = reusable;
  } else {
    const { buffer, sha256 } = await downloadApk(release);
    const tempPath = join(outputDir, `${fileName}.tmp`);
    await writeFile(tempPath, buffer);
    await rename(tempPath, join(outputDir, fileName));
    artifact = { size: buffer.length, sha256 };
    log(`fetched ${fileName} from ${release.tagName}`);
  }

  await pruneApks(fileName);

  const siteOrigin = await resolveSiteOrigin();
  const manifest = {
    platform: 'android',
    versionName: release.versionName,
    ...(release.versionCode === undefined ? {} : { versionCode: release.versionCode }),
    tagName: release.tagName,
    size: artifact.size,
    sha256: artifact.sha256,
    publishedAt: release.publishedAt,
    apkPath,
    ...(siteOrigin ? { apkUrl: `${siteOrigin}${apkPath}` } : {}),
    releaseUrl: release.releaseUrl,
    source: 'github-release',
    mirroredAt: new Date().toISOString(),
  };

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  log(`mirrored ${release.tagName} (${(artifact.size / 1024 / 1024).toFixed(1)} MB) at ${apkPath}`);
}

if (process.env.LAWVER_SKIP_APK_MIRROR === '1') {
  log('LAWVER_SKIP_APK_MIRROR=1, leaving public/apk untouched');
} else {
  // A previous manifest is deliberately kept on failure: a slightly older but
  // verified APK beats sending visitors back to a link they may not reach.
  mirror().catch((error) => {
    warn(`${error?.message || error}`);
    warn('continuing without a refreshed mirror; the download button uses its fallback link');
  });
}
