export function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) throw new Error('chunkSize must be positive');
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}
