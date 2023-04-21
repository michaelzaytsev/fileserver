import fsPromises from 'fs/promises';
import path from 'path';

export const createTag = (): string => Date.now() + '-' + Math.round(Math.random() * 1e9);

export const getUploadsPath = (...paths: string[]): string => path.join(__dirname, 'uploads', ...paths);

export async function createDirectoryIfNotExists(
  directoryPath: string, mkdirOptions?: Parameters<typeof fsPromises.mkdir>[1]): Promise<void> {
  try {
    await fsPromises.stat(directoryPath);
  } catch (error) {
    await fsPromises.mkdir(directoryPath, mkdirOptions);
  }
};
