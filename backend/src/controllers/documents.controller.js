const documentsService = require('../services/documents.service');

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo foi enviado.' });
  }

  const owner = req.body.owner || 'anonymous';
  const document = documentsService.createDocument(req.file, owner);
  return res.status(201).json(document);
}

function list(req, res) {
  const { owner } = req.query;
  if (owner !== undefined && typeof owner !== 'string') {
    return res.status(400).json({ error: 'O parâmetro owner deve ser único.' });
  }

  return res.json(documentsService.listDocuments(owner));
}

function download(req, res, next) {
  const document = documentsService.getDocumentForDownload(req.params.id);
  if (!document) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  return res.download(document.storedPath, document.originalName, (error) => {
    if (!error || res.headersSent) {
      if (error) {
        next(error);
      }
      return;
    }

    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    return next(error);
  });
}

module.exports = {
  upload,
  list,
  download,
};
