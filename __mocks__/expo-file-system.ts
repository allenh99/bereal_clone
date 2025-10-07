const store = new Map<string, string>();
const failReadPatterns: RegExp[] = [];
const failWritePatterns: RegExp[] = [];
const delays: { pattern: RegExp; ms: number }[] = [];

function matches(patterns: RegExp[], path: string) {
	return patterns.some((rx) => rx.test(path));
}

function delayFor(path: string) {
	let ms = 0;
	for (const d of delays) {
		if (d.pattern.test(path)) ms = Math.max(ms, d.ms);
	}
	return ms;
}

async function withDelay(path: string) {
	const ms = delayFor(path);
	if (ms > 0) await new Promise((r) => setTimeout(r, ms));
}

const FileSystem = {
	documentDirectory: 'fs://doc/',
	EncodingType: { Base64: 'base64' },
	getInfoAsync: async (path: string) => {
		await withDelay(path);
		if (matches(failReadPatterns, path)) throw new Error(`FS_READ_FAIL: ${path}`);
		return {
			exists: store.has(path) || [...store.keys()].some((k) => k.startsWith(path)),
			uri: path,
			isDirectory: [...store.keys()].some((k) => k.startsWith(path + '/')),
		};
	},
	makeDirectoryAsync: async (path?: string) => {
		if (path) await withDelay(path);
	},
	readAsStringAsync: async (path: string) => {
		await withDelay(path);
		if (matches(failReadPatterns, path)) throw new Error(`FS_READ_FAIL: ${path}`);
		if (!store.has(path)) throw new Error(`ENOENT: ${path}`);
		return store.get(path)!;
	},
	writeAsStringAsync: async (path: string, content: string, opts?: any) => {
		await withDelay(path);
		if (matches(failWritePatterns, path)) throw new Error(`FS_WRITE_FAIL: ${path}`);
		store.set(path, content);
	},
	readDirectoryAsync: async (dir: string) => {
		await withDelay(dir);
		if (matches(failReadPatterns, dir)) throw new Error(`FS_READ_FAIL: ${dir}`);
		const prefix = dir.endsWith('/') ? dir : `${dir}/`;
		const names = new Set<string>();
		for (const key of store.keys()) {
			if (key.startsWith(prefix)) {
				const rel = key.slice(prefix.length);
				const [name] = rel.split('/');
				if (name) names.add(name);
			}
		}
		return [...names];
	},
	__reset: () => {
		store.clear();
		failReadPatterns.length = 0;
		failWritePatterns.length = 0;
		delays.length = 0;
	},
	__setReadFailure: (pattern: RegExp | string) => {
		failReadPatterns.push(typeof pattern === 'string' ? new RegExp(pattern) : pattern);
	},
	__setWriteFailure: (pattern: RegExp | string) => {
		failWritePatterns.push(typeof pattern === 'string' ? new RegExp(pattern) : pattern);
	},
	__clearFailures: () => {
		failReadPatterns.length = 0;
		failWritePatterns.length = 0;
	},
	__setDelay: (pattern: RegExp | string, ms: number) => {
		delays.push({ pattern: typeof pattern === 'string' ? new RegExp(pattern) : pattern, ms });
	},
	__clearDelays: () => {
		delays.length = 0;
	},
};

module.exports = FileSystem;


