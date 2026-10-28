const documentsRepository = require('../repositories/documents.repository');
const documentsMapper = require('./documents.mapper');

function createDocument(file, owner) {
  const document = documentsRepository.create(
    documentsMapper.toDocumentRecord(file, owner),
  );

  return documentsMapper.toPublicDocument(document);
}

function listDocuments(owner) {
  return documentsRepository.findAll(owner).map(documentsMapper.toPublicDocument);
}

function getDocumentForDownload(id) {
  return documentsRepository.findById(id);
}

module.exports = {
  createDocument,
  listDocuments,
  getDocumentForDownload,
};
