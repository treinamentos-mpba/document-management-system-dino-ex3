const documentsRepository = require('../repositories/documents.repository');
const documentsMapper = require('./documents.mapper');

function createDocument(file, owner) {
  const documentRecord = documentsMapper.toDocumentRecord(
    file,
    owner,
    new Date().toISOString(),
  );
  const document = documentsRepository.create(documentRecord);

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
