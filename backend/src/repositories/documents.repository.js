const documents = new Map();

function create(document) {
  documents.set(document.id, document);
  return document;
}

function findAll(owner) {
  const allDocuments = Array.from(documents.values());

  if (owner === undefined) {
    return allDocuments;
  }

  return allDocuments.filter((document) => document.owner === owner);
}

function findById(id) {
  return documents.get(id) || null;
}

module.exports = {
  create,
  findAll,
  findById,
};
