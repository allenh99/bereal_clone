import * as FS from 'expo-file-system';

const base = `${(FS as any).documentDirectory || 'mock://documents/'}BeReal/`;
const usersFile = `${base}users.json`;
const sessionFile = `${base}session.json`;

type User = { id: string; email: string; passwordHash: string; salt: string; role: 'admin' | 'viewer'; createdAt: number };

export async function seedUsers(users: User[], sessionUserId?: string) {
  await (FS as any).makeDirectoryAsync(base, { intermediates: true });
  await (FS as any).writeAsStringAsync(usersFile, JSON.stringify({ users }));
  await (FS as any).writeAsStringAsync(sessionFile, JSON.stringify(sessionUserId ? { userId: sessionUserId } : {}));
}

export function buildUser(id: string, email: string, role: 'admin' | 'viewer'): User {
  return { id, email, role, passwordHash: 'hash_pw:salt', salt: 'salt', createdAt: Date.now() } as any;
}


