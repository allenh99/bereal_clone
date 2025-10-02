import * as FileSystem from 'expo-file-system/legacy';

export type Emoji = '👍' | '😂' | '❤️' | '😮';

type ReactionRecord = {
  postKey: string;
  userId: string;
  emoji: Emoji;
};

type ReactionsFile = { reactions: ReactionRecord[] };

export class ReactionsService {
  private static baseDir = `${FileSystem.documentDirectory}BeReal/`;
  private static file = `${ReactionsService.baseDir}reactions.json`;

  static defaultEmojis(): Emoji[] {
    return ['👍', '😂', '❤️', '😮'];
  }

  private static async readAll(): Promise<ReactionRecord[]> {
    const info = await FileSystem.getInfoAsync(this.file);
    if (!info.exists) return [];
    try {
      const raw = await FileSystem.readAsStringAsync(this.file);
      const parsed = JSON.parse(raw || '{}') as ReactionsFile;
      return parsed.reactions || [];
    } catch {
      return [];
    }
  }

  private static async writeAll(list: ReactionRecord[]): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.baseDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.baseDir, { intermediates: true });
    }
    await FileSystem.writeAsStringAsync(this.file, JSON.stringify({ reactions: list }));
  }

  static async getSummary(postKey: string, viewerUserId: string): Promise<{ counts: Record<Emoji, number>; mine: Emoji | null }> {
    const list = await this.readAll();
    const counts: Record<Emoji, number> = { '👍': 0, '😂': 0, '❤️': 0, '😮': 0 };
    let mine: Emoji | null = null;
    for (const r of list) {
      if (r.postKey !== postKey) continue;
      counts[r.emoji] = (counts[r.emoji] || 0) + 1;
      if (r.userId === viewerUserId) mine = r.emoji;
    }
    return { counts, mine };
  }

  static async toggle(postKey: string, userId: string, emoji: Emoji): Promise<void> {
    const list = await this.readAll();
    // Remove existing reaction by this user for this post
    const withoutMine = list.filter((r) => !(r.postKey === postKey && r.userId === userId));
    // Determine if we are toggling off or setting a new one
    const existing = list.find((r) => r.postKey === postKey && r.userId === userId);
    if (!existing || existing.emoji !== emoji) {
      withoutMine.push({ postKey, userId, emoji });
    }
    await this.writeAll(withoutMine);
  }
}


