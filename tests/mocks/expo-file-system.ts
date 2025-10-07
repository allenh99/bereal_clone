type FileInfo = { exists: boolean; uri?: string; isDirectory?: boolean };

const files = new Map<string, string>();
const dirs = new Set<string>();

function normalize(path: string): string {
  return path.replace(/\\/g, '/');
}

export const documentDirectory = 'mock://documents/';

export async function getInfoAsync(path: string): Promise<FileInfo> {
  const p = normalize(path);
  if (files.has(p)) return { exists: true, uri: p, isDirectory: false } as any;
  if (dirs.has(p) || p.endsWith('/')) return { exists: true, uri: p, isDirectory: true } as any;
  return { exists: false } as any;
}

export async function makeDirectoryAsync(path: string, _opts?: { intermediates?: boolean }): Promise<void> {
  const p = normalize(path);
  let curr = '';
  for (const seg of p.split('/')) {
    if (!seg) continue;
    curr += seg + '/';
    dirs.add(curr);
  }
}

export enum EncodingType {
  Base64 = 'base64',
  UTF8 = 'utf8',
}

export async function writeAsStringAsync(path: string, contents: string, _opts?: { encoding?: EncodingType }): Promise<void> {
  const p = normalize(path);
  const dir = p.substring(0, p.lastIndexOf('/') + 1);
  dirs.add(dir);
  files.set(p, contents);
}

export async function readAsStringAsync(path: string, _opts?: { encoding?: EncodingType }): Promise<string> {
  const p = normalize(path);
  const v = files.get(p);
  if (v == null) throw new Error('ENOENT: ' + p);
  return v;
}

export async function readDirectoryAsync(path: string): Promise<string[]> {
  const p = normalize(path);
  const out: string[] = [];
  for (const key of files.keys()) {
    if (key.startsWith(p)) {
      const rest = key.slice(p.length);
      if (rest && !rest.includes('/')) out.push(rest);
    }
  }
  return out;
}

export async function deleteAsync(path: string): Promise<void> {
  const p = normalize(path);
  files.delete(p);
}

// Legacy export name used in app code
const legacy = {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  writeAsStringAsync,
  readAsStringAsync,
  readDirectoryAsync,
  deleteAsync,
  EncodingType,
};

module.exports = legacy;


