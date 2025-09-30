import * as FileSystem from 'expo-file-system/legacy';
import { AuthService } from './AuthService';

export type CameraFacing = 'front' | 'back';

export interface SavedPhotoMeta {
  uri: string;
  filename: string;
  dateKey: string; // YYYYMMDD
  timeKey: string; // HHMMSS
  camera: CameraFacing;
  status: 'ontime' | `late_${number}`;
}

export class FileManagerService {
  static baseDir = `${FileSystem.documentDirectory}BeReal/`;
  static photosDir = `${FileManagerService.baseDir}photos/`;
  static allPhotosDir = `${FileManagerService.baseDir}all_photos/`;
  static usersRoot = `${FileManagerService.baseDir}users/`;

  static async ensureDirs(): Promise<void> {
    const current = AuthService.getCurrentUserSync();
    const userScoped = current ? `${this.usersRoot}${current.id}/` : null;
    const photosDir = userScoped ? `${userScoped}photos/` : this.photosDir;
    const allPhotosDir = userScoped ? `${userScoped}all_photos/` : this.allPhotosDir;
    // Assign effective dirs for downstream usage
    (this as any).effectivePhotosDir = photosDir;
    (this as any).effectiveAllPhotosDir = allPhotosDir;
    for (const dir of [this.baseDir, this.usersRoot, photosDir, allPhotosDir]) {
      const info = await FileSystem.getInfoAsync(dir);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
    }
  }

  static buildFilenames(date: Date, camera: CameraFacing, isLateSeconds: number | 0, base?: { dateKey: string; timeKey: string }) {
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const SS = String(date.getSeconds()).padStart(2, '0');
    const dateKey = base?.dateKey ?? `${yyyy}${mm}${dd}`;
    const timeKey = base?.timeKey ?? `${HH}${MM}${SS}`;
    const status = isLateSeconds && isLateSeconds > 0 ? `late_${isLateSeconds}` : 'ontime';
    const filename = `${dateKey}_${timeKey}_${camera}_${status}.jpg`;
    return { filename, dateKey, timeKey, status } as const;
  }

  static async saveJpeg(base64: string, date: Date, camera: CameraFacing, isLateSeconds: number | 0, base?: { dateKey: string; timeKey: string }): Promise<SavedPhotoMeta> {
    await this.ensureDirs();
    const { filename, dateKey, timeKey, status } = this.buildFilenames(date, camera, isLateSeconds, base);
    const effectiveAllPhotosDir = (this as any).effectiveAllPhotosDir || this.allPhotosDir;
    const dest = `${effectiveAllPhotosDir}${filename}`;
    await FileSystem.writeAsStringAsync(dest, base64, { encoding: FileSystem.EncodingType.Base64 });
    return { uri: dest, filename, dateKey, timeKey, camera, status: status as SavedPhotoMeta['status'] };
  }

  static async listAll(limit: number, offset: number): Promise<FileSystem.FileInfo[]> {
    await this.ensureDirs();
    const effectiveAllPhotosDir = (this as any).effectiveAllPhotosDir || this.allPhotosDir;
    const files = await FileSystem.readDirectoryAsync(effectiveAllPhotosDir);
    const jpgs = files.filter((f) => f.endsWith('.jpg')).sort((a, b) => (a < b ? 1 : -1));
    const slice = jpgs.slice(offset, offset + limit);
    const infos = await Promise.all(slice.map((name) => FileSystem.getInfoAsync(`${effectiveAllPhotosDir}${name}`)));
    return infos as any;
  }
}


