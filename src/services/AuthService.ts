import * as FileSystem from 'expo-file-system/legacy';
import { getRandomBytesAsync, digestStringAsync, CryptoDigestAlgorithm } from 'expo-crypto';

export type UserRole = 'admin' | 'viewer';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  createdAt: number;
}

type UsersFile = { users: UserRecord[] };

export class AuthService {
  private static baseDir = `${FileSystem.documentDirectory}BeReal/`;
  private static usersFile = `${AuthService.baseDir}users.json`;
  private static sessionFile = `${AuthService.baseDir}session.json`;
  private static currentUserCache: UserRecord | null = null;

  static async ensureBaseDir(): Promise<void> {
    const info = await FileSystem.getInfoAsync(this.baseDir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(this.baseDir, { intermediates: true });
    }
  }

  static async ensureLoaded(): Promise<void> {
    if (this.currentUserCache) return;
    await this.ensureBaseDir();
    const sessionInfo = await FileSystem.getInfoAsync(this.sessionFile);
    if (!sessionInfo.exists) {
      this.currentUserCache = null;
      return;
    }
    try {
      const raw = await FileSystem.readAsStringAsync(this.sessionFile);
      const { userId } = JSON.parse(raw || '{}') as { userId?: string };
      if (!userId) {
        this.currentUserCache = null;
        return;
      }
      const user = await this.findUserById(userId);
      this.currentUserCache = user;
    } catch {
      this.currentUserCache = null;
    }
  }

  static async getUsers(): Promise<UserRecord[]> {
    await this.ensureBaseDir();
    const info = await FileSystem.getInfoAsync(this.usersFile);
    if (!info.exists) return [];
    try {
      const raw = await FileSystem.readAsStringAsync(this.usersFile);
      const parsed = JSON.parse(raw || '{}') as UsersFile;
      return parsed.users || [];
    } catch {
      return [];
    }
  }

  private static async writeUsers(users: UserRecord[]): Promise<void> {
    await this.ensureBaseDir();
    const data: UsersFile = { users };
    await FileSystem.writeAsStringAsync(this.usersFile, JSON.stringify(data));
  }

  static async findUserById(userId: string): Promise<UserRecord | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === userId) || null;
  }

  static getCurrentUserSync(): UserRecord | null {
    return this.currentUserCache;
  }

  static async getCurrentUser(): Promise<UserRecord | null> {
    await this.ensureLoaded();
    return this.currentUserCache;
  }

  static async logout(): Promise<void> {
    this.currentUserCache = null;
    await this.ensureBaseDir();
    await FileSystem.writeAsStringAsync(this.sessionFile, JSON.stringify({}));
  }

  static async signup(email: string, password: string): Promise<UserRecord> {
    const users = await this.getUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new Error('Email already registered');
    }
    const saltBytes = await getRandomBytesAsync(16);
    const salt = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
    const passwordHash = await digestStringAsync(CryptoDigestAlgorithm.SHA256, `${password}:${salt}`);
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const role: UserRole = users.length === 0 ? 'admin' : 'viewer';
    const user: UserRecord = { id, email, passwordHash, salt, role, createdAt: Date.now() };
    users.push(user);
    await this.writeUsers(users);
    await FileSystem.writeAsStringAsync(this.sessionFile, JSON.stringify({ userId: id }));
    this.currentUserCache = user;
    return user;
  }

  static async login(email: string, password: string): Promise<UserRecord> {
    const users = await this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('Invalid credentials');
    const hash = await digestStringAsync(CryptoDigestAlgorithm.SHA256, `${password}:${user.salt}`);
    if (hash !== user.passwordHash) throw new Error('Invalid credentials');
    await FileSystem.writeAsStringAsync(this.sessionFile, JSON.stringify({ userId: user.id }));
    this.currentUserCache = user;
    return user;
  }
}


