import assert from 'node:assert/strict';
import { test } from 'node:test';
import { downloadDocument, listDocuments, uploadDocument } from '../src/services/api.js';

test('lista documentos via /api e encaminha o sinal de cancelamento', async (t) => {
  const documents = [{ id: '123', originalName: 'teste.txt' }];
  const signal = new AbortController().signal;
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(documents));

  assert.deepEqual(await listDocuments({ signal }), documents);
  assert.deepEqual(fetchMock.mock.calls[0].arguments, ['/api/documents', { signal }]);
});

test('envia arquivo e dono em multipart sem sobrescrever Content-Type', async (t) => {
  const file = new File(['conteúdo'], 'teste.txt', { type: 'text/plain' });
  const document = { id: '123', originalName: file.name };
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json(document, { status: 201 }));

  assert.deepEqual(await uploadDocument(file, ' Maria '), document);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, '/api/upload');
  assert.equal(options.method, 'POST');
  assert.equal(options.body.get('file').name, file.name);
  assert.equal(await options.body.get('file').text(), 'conteúdo');
  assert.equal(options.body.get('owner'), 'Maria');
  assert.equal(options.headers, undefined);
});

test('omite dono vazio para preservar o padrão do backend', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ id: '123' }));
  await uploadDocument(new File(['teste'], 'teste.txt'));
  assert.equal(fetchMock.mock.calls[0].arguments[1].body.has('owner'), false);
});

test('baixa conteúdo binário usando um id codificado', async (t) => {
  const bytes = new Uint8Array([0, 1, 128, 255]);
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(bytes));
  const blob = await downloadDocument('id /?');

  assert.deepEqual(new Uint8Array(await blob.arrayBuffer()), bytes);
  assert.equal(fetchMock.mock.calls[0].arguments[0], '/api/documents/id%20%2F%3F/download');
});

test('propaga mensagens do backend em todas as operações', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json(
    { error: 'Documento não encontrado.' },
    { status: 404 },
  ));

  for (const operation of [
    () => listDocuments(),
    () => uploadDocument(new File(['teste'], 'teste.txt')),
    () => downloadDocument('ausente'),
  ]) {
    await assert.rejects(operation, { message: 'Documento não encontrado.' });
  }
});

test('informa o status HTTP quando o proxy retorna uma falha não JSON', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<h1>Bad gateway</h1>', { status: 502 }));
  await assert.rejects(listDocuments(), { message: 'Falha na requisição (HTTP 502).' });
});

test('propaga falhas de rede e cancelamentos para a interface', async (t) => {
  const error = new TypeError('Failed to fetch');
  t.mock.method(globalThis, 'fetch', async () => { throw error; });
  await assert.rejects(listDocuments(), error);

  const aborted = new DOMException('Cancelado', 'AbortError');
  t.mock.method(globalThis, 'fetch', async () => { throw aborted; });
  await assert.rejects(listDocuments(), aborted);
});
