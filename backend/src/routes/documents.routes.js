const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');

const storageDirectory = path.resolve(
  process.env.STORAGE_DIR || path.join(__dirname, '../../storage'),
);
const maxFileSize = Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024);

if (!Number.isSafeInteger(maxFileSize) || maxFileSize <= 0) {
  throw new Error('MAX_FILE_SIZE deve ser um inteiro positivo em bytes.');
}

fs.mkdirSync(storageDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, storageDirectory),
  filename: (_req, _file, callback) => callback(null, crypto.randomUUID()),
});
const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
});

const router = express.Router();

router.post('/upload', upload.single('file'), documentsController.upload);
router.get('/documents', documentsController.list);
router.get('/documents/:id/download', documentsController.download);

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'O arquivo excede o tamanho máximo permitido.',
      });
    }

    return res.status(400).json({ error: 'Não foi possível processar o arquivo enviado.' });
  }

  return next(error);
});

module.exports = router;
