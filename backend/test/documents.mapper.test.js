const { test } = require('node:test');
const assert = require('node:assert/strict');
const documentsMapper = require('../src/services/documents.mapper');

test('maps an uploaded file to the stored document shape', () => {
  const uploadedAt = '2026-10-28T19:00:00.000Z';

  assert.deepEqual(
    documentsMapper.toDocumentRecord(
      {
        filename: 'arquivo-id',
        originalname: 'relatorio.txt',
        path: '/storage/arquivo-id',
        mimetype: 'text/plain',
        size: 12,
      },
      'maria',
      uploadedAt,
    ),
    {
      id: 'arquivo-id',
      originalName: 'relatorio.txt',
      storedName: 'arquivo-id',
      storedPath: '/storage/arquivo-id',
      mimeType: 'text/plain',
      size: 12,
      uploadedAt,
      owner: 'maria',
    },
  );
});

test('maps a stored document to its public shape without storage details', () => {
  const document = {
    id: 'arquivo-id',
    originalName: 'relatorio.txt',
    storedName: 'arquivo-id',
    storedPath: '/storage/arquivo-id',
    mimeType: 'text/plain',
    size: 12,
    uploadedAt: '2026-10-28T19:00:00.000Z',
    owner: 'maria',
  };

  assert.deepEqual(documentsMapper.toPublicDocument(document), {
    id: 'arquivo-id',
    originalName: 'relatorio.txt',
    mimeType: 'text/plain',
    size: 12,
    uploadedAt: '2026-10-28T19:00:00.000Z',
    owner: 'maria',
  });
});
