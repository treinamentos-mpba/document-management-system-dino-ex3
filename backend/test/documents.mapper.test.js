const { test } = require('node:test');
const assert = require('node:assert/strict');
const documentsMapper = require('../src/services/documents.mapper');

test('mapeia arquivo recebido para registro e projeta apenas campos públicos', () => {
  const file = {
    filename: 'arquivo-id',
    originalname: 'relatorio.txt',
    path: '/storage/arquivo-id',
    mimetype: 'text/plain',
    size: 12,
  };

  const record = documentsMapper.toDocumentRecord(file, 'maria');

  assert.deepEqual(record, {
    id: 'arquivo-id',
    originalName: 'relatorio.txt',
    storedName: 'arquivo-id',
    storedPath: '/storage/arquivo-id',
    mimeType: 'text/plain',
    size: 12,
    uploadedAt: record.uploadedAt,
    owner: 'maria',
  });
  assert.equal(Number.isNaN(Date.parse(record.uploadedAt)), false);
  assert.deepEqual(documentsMapper.toPublicDocument(record), {
    id: 'arquivo-id',
    originalName: 'relatorio.txt',
    mimeType: 'text/plain',
    size: 12,
    uploadedAt: record.uploadedAt,
    owner: 'maria',
  });
});
