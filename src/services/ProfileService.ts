import * as FileSystem from 'expo-file-system/legacy';
import { AuthService, UserRecord, UserRole } from './AuthService';

export interface ProfileRecord {
  userId: string;
  displayName: string;
  bio?: string;
}

type ProfilesFile = { profiles: ProfileRecord[] };

export class ProfileService {
  private static baseDir = `${FileSystem.documentDirectory}BeReal/`;
  private static profilesFile = `${ProfileService.baseDir}profiles.json`;

  static async getProfile(userId: string): Promise<ProfileRecord | null> {
    const list = await this.getAllProfiles();
    return list.find((p) => p.userId === userId) || null;
  }

  static async getAllProfiles(): Promise<ProfileRecord[]> {
    const info = await FileSystem.getInfoAsync(this.profilesFile);
    if (!info.exists) return [];
    try {
      const raw = await FileSystem.readAsStringAsync(this.profilesFile);
      const parsed = JSON.parse(raw || '{}') as ProfilesFile;
      return parsed.profiles || [];
    } catch {
      return [];
    }
  }

  private static async writeAll(profiles: ProfileRecord[]): Promise<void> {
    await FileSystem.writeAsStringAsync(this.profilesFile, JSON.stringify({ profiles }));
  }

  static async upsertProfile(userId: string, update: Partial<ProfileRecord>): Promise<ProfileRecord> {
    const all = await this.getAllProfiles();
    const existing = all.find((p) => p.userId === userId);
    const next: ProfileRecord = {
      userId,
      displayName: existing?.displayName || '',
      bio: existing?.bio,
      ...update,
    };
    if (!existing) {
      all.push(next);
    } else {
      const idx = all.findIndex((p) => p.userId === userId);
      all[idx] = next;
    }
    await this.writeAll(all);
    return next;
  }

  static canUser(action: 'capture' | 'view_all' | 'manage_users', user: UserRecord | null): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    // viewers can capture and view timeline but cannot manage users
    if (action === 'manage_users') return false;
    return action === 'capture' || action === 'view_all';
  }
}



