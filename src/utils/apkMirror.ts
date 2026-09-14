import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Shape of `public/apk/version.json`, written by `scripts/fetch-apk.mjs` during
 * the build. It describes the APK this deployment hosts itself.
 */
export interface ApkMirrorManifest {
  platform?: string;
  versionName?: string;
  versionCode?: number;
  tagName?: string;
  size?: number;
  sha256?: string;
  publishedAt?: string;
  apkPath?: string;
  apkUrl?: string;
  releaseUrl?: string;
  source?: string;
  mirroredAt?: string;
}

// Resolved against the working directory: the build runs from the project root,
// and `import.meta.url` is not stable once Astro bundles the page modules.
const manifestPath = join(process.cwd(), 'public', 'apk', 'version.json');

/**
 * Read the mirror manifest, or `null` when this build has no mirrored APK.
 * Callers fall back to the external release sources in that case.
 */
export async function readApkMirrorManifest(): Promise<ApkMirrorManifest | null> {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as ApkMirrorManifest;
    return manifest?.apkPath ? manifest : null;
  } catch {
    return null;
  }
}
