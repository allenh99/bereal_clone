import * as FileSystem from 'expo-file-system/legacy';
import { FileManagerService } from './FileManagerService';

type Post = {
  key: string;
  dateKey: string;
  timeKey: string;
  front?: { uri: string; filename: string };
  back?: { uri: string; filename: string };
  statusLabel: string;
  displayDate: string;
};

export class TimelineService {
  private static page = 0;
  private static pageSize = 20;
  private static cache: Record<string, Post> = {};

  static reset() {
    this.page = 0;
    this.cache = {};
  }

  static async loadNextPage(): Promise<void> {
    const offset = this.page * this.pageSize;
    const infos = await FileManagerService.listAll(this.pageSize, offset);
    const files = (await FileSystem.readDirectoryAsync(FileManagerService.allPhotosDir)).filter((f) => f.endsWith('.jpg')).sort((a, b) => (a < b ? 1 : -1)).slice(offset, offset + this.pageSize);
    for (const name of files) {
      const match = name.match(/(\d{8})_(\d{6})_(front|back)_(ontime|late_\d+)\.jpg/);
      if (!match) continue;
      const [, dateKey, timeKey, camera, status] = match;
      const key = `${dateKey}_${timeKey}`;
      const uri = `${FileManagerService.allPhotosDir}${name}`;
      const displayDate = `${dateKey.slice(0,4)}-${dateKey.slice(4,6)}-${dateKey.slice(6,8)} ${timeKey.slice(0,2)}:${timeKey.slice(2,4)}:${timeKey.slice(4,6)}`;
      const statusLabel = status === 'ontime' ? 'On time' : `Late ${status.split('_')[1]}s`;
      this.cache[key] = this.cache[key] || { key, dateKey, timeKey, statusLabel, displayDate } as Post;
      if (camera === 'front') this.cache[key].front = { uri, filename: name };
      if (camera === 'back') this.cache[key].back = { uri, filename: name };
    }
    this.page += 1;
  }

  static groupedPosts(): Post[] {
    return Object.values(this.cache).sort((a, b) => (a.key < b.key ? 1 : -1));
  }
}


