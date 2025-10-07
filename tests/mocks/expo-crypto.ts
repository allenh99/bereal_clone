export enum CryptoDigestAlgorithm { SHA256 = 'SHA-256' }
export async function digestStringAsync(_alg: CryptoDigestAlgorithm, input: string) {
  return 'hash_' + input;
}

export async function getRandomBytesAsync(length: number): Promise<Uint8Array> {
  const arr = new Uint8Array(length);
  for (let i = 0; i < length; i++) arr[i] = i % 256;
  return arr;
}

module.exports = { CryptoDigestAlgorithm, digestStringAsync, getRandomBytesAsync };


