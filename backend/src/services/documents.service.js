const documentsRepository = require('../repositories/documents.repository');

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    mimeType: document.mimeType,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

function createDocument(file, owner) {
  const document = documentsRepository.create({
    id: file.filename,
    originalName: file.originalname,
    storedName: file.filename,
    storedPath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  });

  return toPublicDocument(document);
}

function listDocuments(owner) {
  return documentsRepository.findAll(owner).map(toPublicDocument);
}

function getDocumentForDownload(id) {
  return documentsRepository.findById(id);
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
};
