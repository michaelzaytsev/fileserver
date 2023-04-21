import fs from 'fs';
import path from 'path';
import yauzl, { Entry } from 'yauzl';
import { createDirectoryIfNotExists, createTag, getUploadsPath } from './utils';

export const unzipFile = (filetag: string): Promise<string[]> => new Promise<string[]>((resolve, reject) =>
  yauzl.open(getUploadsPath(filetag), { lazyEntries: true }, async (error, zipfile) => {
    if (error) {
      reject(error);
      return;
    }

    const tag = createTag();
    await fs.promises.mkdir(getUploadsPath(tag));
    const tags: string[] = [];

    zipfile.on('close', () => resolve(tags));
    zipfile.on('error', error => reject(error));

    zipfile.on('entry', async (entry: Entry) => {
      if (/\/$/.test(entry.fileName)) {
        await createDirectoryIfNotExists(getUploadsPath(tag, entry.fileName));
        zipfile.readEntry();
      } else {
        zipfile.openReadStream(entry, async (error, readStream) => {
          if (error) {
            reject(error);
            return;
          }

          readStream.on('end', () => zipfile.readEntry());
          const parsedPath = path.parse(entry.fileName);
          if (parsedPath.dir) {
            await createDirectoryIfNotExists(getUploadsPath(tag, parsedPath.dir));
          }

          readStream.pipe(fs.createWriteStream(getUploadsPath(tag, entry.fileName)));
          tags.push(path.join(tag, entry.fileName));
        });
      }
    });

    zipfile.readEntry();
  }));
