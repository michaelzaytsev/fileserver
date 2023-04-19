import path from 'path';

export const createTag = (): string => Date.now() + '-' + Math.round(Math.random() * 1e9);

export const getUploadsPath = (...paths: string[]): string => path.join(__dirname, 'uploads', ...paths);
