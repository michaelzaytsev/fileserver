import cors from 'cors';
import express from 'express';
import fsPromises from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { deleteFiles, unzipFiles, uploadFiles } from './controllers';
import { createTag, getUploadsPath } from './utils';

const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    if (!req.state.filepath) {
      req.state.filepath = getUploadsPath(createTag());
      await fsPromises.mkdir(req.state.filepath, { recursive: true });
    }
    cb(null, req.state.filepath);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });
const app = express();

app.use(cors());
app.use((req, res, next) => {
  req.state = {};
  next();
});

app.use('/', express.static(path.join(__dirname, 'uploads')));
app.post('/', upload.array('files'), uploadFiles);
app.put('/;unzipped', unzipFiles);
app.delete('/', deleteFiles);

app.listen(port, () => console.info(`[FileServer] Application is running on http://127.0.0.1:${port}.`));

declare global {
  namespace Express {
    interface Request {
      state: Record<string, any>;
    }
  }
}
