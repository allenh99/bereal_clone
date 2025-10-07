import { resetFs, seedUsers, seedProfiles, seedReactions, seedPhoto, writeJson } from '../fsTestHelpers';

// Paths used by services
const BASE = 'fs://doc/BeReal/';
const USERS = `${BASE}users.json`;
const SESSION = `${BASE}session.json`;
const PROFILES = `${BASE}profiles.json`;
const REACTIONS = `${BASE}reactions.json`;

export async function installEmptyState() {
	resetFs();
	await writeJson(USERS, { users: [] });
	await writeJson(SESSION, {});
	await writeJson(PROFILES, { profiles: [] });
	await writeJson(REACTIONS, { reactions: [] });
}

export async function installLoadingState({ delayMs = 500 }: { delayMs?: number } = {}) {
	// Simulate loading by delaying reads for BeReal directory
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const FS = require('../../../__mocks__/expo-file-system');
	FS.__clearDelays();
	FS.__setDelay(/fs:\/\/doc\/BeReal\//, delayMs);
	await installEmptyState();
}

export async function installErrorState({
	readFailPattern = /fs:\/\/doc\/BeReal\//,
	writeFailPattern,
}: {
	readFailPattern?: RegExp | string;
	writeFailPattern?: RegExp | string;
} = {}) {
	// Inject read/write failures
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const FS = require('../../../__mocks__/expo-file-system');
	FS.__clearFailures();
	FS.__setReadFailure(readFailPattern);
	if (writeFailPattern) FS.__setWriteFailure(writeFailPattern);
	await installEmptyState();
}

export type SeedUser = {
	id: string;
	email: string;
	passwordHash?: string; // optional; tests can bypass AuthService
	salt?: string;
	role?: 'admin' | 'viewer';
	createdAt?: number;
};

export type SeedProfile = {
	userId: string;
	displayName: string;
	bio?: string;
};

export type SeedReaction = { postKey: string; userId: string; emoji: '👍' | '😂' | '❤️' | '😮' };

export async function installPopulatedState({
	users,
	sessionUserId,
	profiles,
	reactions,
	photos,
}: {
	users: SeedUser[];
	sessionUserId?: string;
	profiles?: SeedProfile[];
	reactions?: SeedReaction[];
	photos?: { userId: string; dateKey: string; timeKey: string; lateSeconds?: number; hasFront?: boolean; hasBack?: boolean }[];
}) {
	resetFs();
	const withDefaults = users.map((u, i) => ({
		id: u.id,
		email: u.email,
		passwordHash: u.passwordHash ?? 'hash',
		salt: u.salt ?? 'salt',
		role: u.role ?? (i === 0 ? 'admin' : 'viewer'),
		createdAt: u.createdAt ?? Date.now() - i * 1000,
	}));
	await seedUsers({ users: withDefaults, sessionUserId });
	if (profiles?.length) await seedProfiles(profiles);
	if (reactions?.length) await seedReactions(reactions);

	if (photos?.length) {
		for (const p of photos) {
			const baseDir = `${BASE}users/${p.userId}/all_photos/`;
			const status = p.lateSeconds && p.lateSeconds > 0 ? `late_${p.lateSeconds}` : 'ontime';
			const backName = `${p.dateKey}_${p.timeKey}_back_${status}.jpg`;
			const frontName = `${p.dateKey}_${p.timeKey}_front_${status}.jpg`;
			if (p.hasBack !== false) await seedPhoto(`${baseDir}${backName}`, 'BASE64JPEG');
			if (p.hasFront !== false) await seedPhoto(`${baseDir}${frontName}`, 'BASE64JPEG');
		}
	}
}

// Convenience bundles for common scenarios
export const fixtures = {
	empty: installEmptyState,
	loading: installLoadingState,
	error: installErrorState,
	populated: installPopulatedState,
};


