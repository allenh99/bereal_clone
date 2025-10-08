// Utilities to seed/reset the in-memory FS mock.
// Obtain the same mocked module instance Jest provides for the app code.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FSModule = require('expo-file-system/legacy');
const FS = FSModule && (FSModule.default ?? FSModule);

export function resetFs() {
	if (typeof FS.__reset === 'function') {
		FS.__reset();
	}
}

export function writeJson(path: string, obj: unknown) {
	return FS.writeAsStringAsync(path, JSON.stringify(obj));
}

export async function seedUsers({ users = [], sessionUserId }: { users?: any[]; sessionUserId?: string }) {
	await writeJson('fs://doc/BeReal/users.json', { users });
	await writeJson('fs://doc/BeReal/session.json', sessionUserId ? { userId: sessionUserId } : {});
}

export async function seedProfiles(profiles: any[]) {
	await writeJson('fs://doc/BeReal/profiles.json', { profiles });
}

export async function seedReactions(reactions: any[]) {
	await writeJson('fs://doc/BeReal/reactions.json', { reactions });
}

export async function seedPhoto(path: string, base64: string) {
	const encoding = FS.EncodingType?.Base64 ?? 'base64';
	await FS.writeAsStringAsync(path, base64, { encoding });
}


