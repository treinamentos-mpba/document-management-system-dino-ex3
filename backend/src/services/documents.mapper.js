function toDocumentRecord(file, owner) {
  return {
    id: file.filename,
    originalName: file.originalname,
    storedName: file.filename,
    storedPath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
  };
}

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

module.exports = {
  toDocumentRecord,
  toPublicDocument,
};
