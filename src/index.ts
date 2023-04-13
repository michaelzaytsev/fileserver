import cors from 'cors';
import express from 'express';
import fsPromises from 'fs/promises';
import multer from 'multer';
import path from 'path';

const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    if (!req.state.filepath) {
      const directory = Date.now() + '-' + Math.round(Math.random() * 1e9);
      req.state.filepath = path.join(__dirname, 'uploads', directory);
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
app.post('/', upload.array('files'), (req, res) => {
  const filetags: string[] = req.files
    ? (req.files as Express.Multer.File[]).map(file => {
        const segments = file.destination.split(path.sep);
        return segments[segments.length - 1] + '/' + file.filename;
      })
    : [];
  res.json(filetags);
});

app.listen(port, () => console.info(`[FileServer] Application is running on http://127.0.0.1:${port}.`));

declare global {
  namespace Express {
    interface Request {
      state: Record<string, any>;
    }
  }
}
