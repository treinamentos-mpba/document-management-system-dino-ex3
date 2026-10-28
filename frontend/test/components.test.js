import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('renderiza formulário, carregamento, lista vazia e metadados com download', async () => {
  const server = await createServer({
    server: { middlewareMode: true, watch: null },
    appType: 'custom',
  });

  try {
    const { default: App } = await server.ssrLoadModule('/src/App.jsx');
    const { default: DocumentList } = await server.ssrLoadModule('/src/components/DocumentList.jsx');
    const app = renderToStaticMarkup(createElement(App));
    assert.match(app, /type="file" required=""/);
    assert.match(app, /name="owner"/);
    assert.match(app, /Carregando documentos/);
    assert.match(app, /Atualizar lista/);

    const empty = renderToStaticMarkup(createElement(DocumentList, { documents: [] }));
    assert.match(empty, /Nenhum documento enviado/);

    const list = renderToStaticMarkup(createElement(DocumentList, {
      documents: [{
        id: '123',
        originalName: '<teste>.txt',
        size: 12,
        uploadedAt: '2026-10-28T12:00:00.000Z',
        owner: 'Maria',
      }],
    }));
    assert.match(list, /&lt;teste&gt;\.txt/);
    assert.match(list, /<td>12<\/td>/);
    assert.match(list, /<td>Maria<\/td>/);
    assert.match(list, /dateTime="2026-10-28T12:00:00.000Z"/);
    assert.match(list, /aria-label="Baixar &lt;teste&gt;\.txt"/);
  } finally {
    await server.close();
  }
});
