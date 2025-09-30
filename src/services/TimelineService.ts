import * as FileSystem from 'expo-file-system/legacy';
import { FileManagerService } from './FileManagerService';
import { AuthService } from './AuthService';

type Post = {
  key: string;
  dateKey: string;
  timeKey: string;
  front?: { uri: string; filename: string };
  back?: { uri: string; filename: string };
  statusLabel: string;
  displayDate: string;
  userId?: string;
  userLabel?: string;
};

export class TimelineService {
  private static page = 0;
  private static pageSize = 20;
  private static cache: Record<string, Post> = {};
  private static scope: 'mine' | 'all' | { userId: string } = 'mine';

  static reset() {
    this.page = 0;
    this.cache = {};
  }

  static setScope(scope: 'mine' | 'all' | { userId: string }) {
    this.scope = scope;
    this.reset();
  }

  static async loadNextPage(): Promise<void> {
    await FileManagerService.ensureDirs();
    const offset = this.page * this.pageSize;
    const currentUser = await AuthService.getCurrentUser();
    const users = await AuthService.getUsers();

    const entries: { userId: string; userLabel: string; name: string; dir: string }[] = [];

    const pushFromDir = async (userId: string, dir: string, userLabel: string) => {
      try {
        const files = (await FileSystem.readDirectoryAsync(dir)).filter((f) => f.endsWith('.jpg'));
        for (const name of files) entries.push({ userId, userLabel, name, dir });
      } catch {
        // ignore missing dirs
      }
    };

    if (this.scope === 'mine') {
      const effectiveAllPhotosDir = (FileManagerService as any).effectiveAllPhotosDir || FileManagerService.allPhotosDir;
      if (currentUser) {
        await pushFromDir(currentUser.id, effectiveAllPhotosDir, users.find((u) => u.id === currentUser.id)?.email || 'Me');
      }
    } else if (typeof this.scope === 'object' && 'userId' in this.scope) {
      const targetId = this.scope.userId;
      const dir = `${FileManagerService.usersRoot}${targetId}/all_photos/`;
      const label = users.find((u) => u.id === targetId)?.email || targetId;
      await pushFromDir(targetId, dir, label);
    } else {
      // all users
      for (const u of users) {
        const dir = `${FileManagerService.usersRoot}${u.id}/all_photos/`;
        await pushFromDir(u.id, dir, u.email);
      }
    }

    // Sort by name descending (date in filename ensures order), then slice for pagination
    entries.sort((a, b) => (a.name < b.name ? 1 : -1));
    const pageSlice = entries.slice(offset, offset + this.pageSize);

    for (const { userId, userLabel, name, dir } of pageSlice) {
      const match = name.match(/(\d{8})_(\d{6})_(front|back)_(ontime|late_\d+)\.jpg/);
      if (!match) continue;
      const [, dateKey, timeKey, camera, status] = match;
      const key = `${userId}_${dateKey}_${timeKey}`;
      const uri = `${dir}${name}`;
      const displayDate = `${dateKey.slice(0,4)}-${dateKey.slice(4,6)}-${dateKey.slice(6,8)} ${timeKey.slice(0,2)}:${timeKey.slice(2,4)}:${timeKey.slice(4,6)}`;
      const statusLabel = status === 'ontime' ? 'On time' : `Late ${status.split('_')[1]}s`;
      this.cache[key] = this.cache[key] || { key, dateKey, timeKey, statusLabel, displayDate, userId, userLabel } as Post;
      if (camera === 'front') this.cache[key].front = { uri, filename: name };
      if (camera === 'back') this.cache[key].back = { uri, filename: name };
    }

    this.page += 1;
  }

  static groupedPosts(): Post[] {
    return Object.values(this.cache).sort((a, b) => (a.key < b.key ? 1 : -1));
  }
}


