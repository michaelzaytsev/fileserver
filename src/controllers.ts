import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { unzipFile } from './services';
import { getUploadsPath } from './utils';

export const uploadFiles = (req: Request, res: Response) => {
  try {
    const filetags: string[] = req.files
      ? (req.files as Express.Multer.File[]).map(file => {
          const segments = file.destination.split(path.sep);
          return segments[segments.length - 1] + '/' + file.filename;
        })
      : [];
    res.json(filetags);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unhandled error.');
  }
};

export const unzipFiles = async (req: Request, res: Response) => {
  try {
    if (!req.query.tags) {
      res.status(400).send('Tags parameter is missing.');
      return;
    }

    const tags = (req.query.tags as string).split(',');
    const unzippedTags: string[][] = [];

    for (const tag of tags) {
      let stats: fs.Stats;
      try {
        stats = await fs.promises.stat(getUploadsPath(tag));
      } catch (error) {
        res.status(404).send(`Tag "${tag}" does not exist.`);
        return;
      }

      if (!stats.isFile()) {
        res.status(404).send(`File of tag "${tag}" does not exist.`);
        return;
      }

      unzippedTags.push(await unzipFile(tag));
    }

    res.send(unzippedTags);
  } catch (error) {
    console.error(error);
    res.status(500).send('Unhandled error.');
  }
};

export const deleteFiles = async (req: Request, res: Response) => {
  try {
    if (!req.query.tags) {
      res.status(400).send('Tags parameter is missing.');
      return;
    }

    const tags = (req.query.tags as string).split(',');

    for (const tag of tags) {
      if (tag === '/' || tag.includes('..')) {
        res.status(400).send(`Tag "${tag}" does not exist.`);
        return;
      }

      const tagpath = getUploadsPath(tag);

      try {
        await fs.promises.stat(tagpath);
      } catch (error) {
        res.status(404).send(`Tag "${tag}" does not exist.`);
        return;
      }

      await fs.promises.rm(tagpath, { recursive: true });
    }

    res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Unhandled error.');
  }
};
