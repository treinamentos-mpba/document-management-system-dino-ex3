function toDocumentRecord(file, owner, uploadedAt) {
  return {
    id: file.filename,
    originalName: file.originalname,
    storedName: file.filename,
    storedPath: file.path,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt,
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
