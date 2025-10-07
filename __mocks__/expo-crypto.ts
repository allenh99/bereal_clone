module.exports = {
	CryptoDigestAlgorithm: { SHA256: 'SHA256' },
	getRandomBytesAsync: async (len: number) => new Uint8Array(Array.from({ length: len }, (_, i) => (i * 7) % 256)),
	digestStringAsync: async (_alg: string, input: string) =>
		Array.from(Buffer.from(input))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')
			.slice(0, 64),
};


