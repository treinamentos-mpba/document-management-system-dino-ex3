const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = storageDirectory;
process.env.MAX_FILE_SIZE = '8';

const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  fs.rmSync(storageDirectory, { recursive: true, force: true });
});

async function uploadDocument({ contents, filename = 'relatorio.txt', owner } = {}) {
  const form = new FormData();
  form.append('file', new Blob([contents ?? 'ok'], { type: 'text/plain' }), filename);
  if (owner !== undefined) {
    form.append('owner', owner);
  }
  return fetch(`${baseUrl}/upload`, { method: 'POST', body: form });
}

test('mantém o endpoint de saúde', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('faz upload, lista e baixa um documento', async () => {
  const uploadResponse = await uploadDocument({ owner: 'maria' });
  assert.equal(uploadResponse.status, 201);

  const document = await uploadResponse.json();
  assert.equal(document.originalName, 'relatorio.txt');
  assert.equal(document.owner, 'maria');
  assert.equal(document.size, 2);
  assert.equal(typeof document.id, 'string');
  assert.equal('storedPath' in document, false);

  const storedFiles = fs.readdirSync(storageDirectory);
  assert.deepEqual(storedFiles, [document.id]);

  const listResponse = await fetch(`${baseUrl}/documents?owner=maria`);
  assert.equal(listResponse.status, 200);
  assert.deepEqual(await listResponse.json(), [document]);

  const downloadResponse = await fetch(
    `${baseUrl}/documents/${document.id}/download`,
  );
  assert.equal(downloadResponse.status, 200);
  assert.match(downloadResponse.headers.get('content-disposition'), /filename="relatorio.txt"/);
  assert.equal(await downloadResponse.text(), 'ok');
});

test('usa anonymous como dono padrão e retorna lista vazia quando não há correspondência', async () => {
  const uploadResponse = await uploadDocument();
  const document = await uploadResponse.json();
  assert.equal(document.owner, 'anonymous');

  const listResponse = await fetch(`${baseUrl}/documents?owner=outro`);
  assert.deepEqual(await listResponse.json(), []);
});

test('retorna 400 quando o upload não contém arquivo', async () => {
  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: new FormData(),
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Nenhum arquivo foi enviado.',
  });
});

test('retorna 413 quando o arquivo ultrapassa o limite', async () => {
  const response = await uploadDocument({ contents: 'conteudo maior que oito bytes' });

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    error: 'O arquivo excede o tamanho máximo permitido.',
  });
});

test('retorna 404 para documento inexistente', async () => {
  const response = await fetch(`${baseUrl}/documents/inexistente/download`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: 'Documento não encontrado.',
  });
});
