# Especificação - Document Management System

> Especificação completa do Document Management System (DMS), gerada a partir
> do modelo `spec-template.md`. Este documento orienta o desenvolvimento guiado
> por especificação (Spec Driven Development) nos próximos passos do workshop.

## 1. Objetivo

Disponibilizar um sistema web que permita enviar, listar e baixar documentos,
com gestão simples por usuário e armazenamento estritamente local à aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de documentos via formulário (multipart/form-data)
- Listagem de documentos com seus metadados
- Download de documentos pelo identificador
- Gestão simples por usuário: cada documento possui um dono (`owner`) e a
  listagem pode ser filtrada por dono (sem autenticação real nesta fase)

### Fora do escopo

- Armazenamento externo ou em nuvem (S3, Azure Blob, etc.)
- Versionamento de documentos
- Autenticação e autorização reais (login, sessões, tokens)
- Edição ou remoção de documentos
- Banco de dados persistente para metadados

## 3. Requisitos funcionais

| ID    | Requisito                                                                                 |
| ----- | ----------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento via multipart/form-data (campo `file`)                 |
| RF-02 | O usuário pode listar os documentos enviados, com seus metadados                          |
| RF-03 | O usuário pode baixar um documento pelo identificador, preservando o nome original        |
| RF-04 | Cada documento enviado é associado a um dono (`owner`)                                    |
| RF-05 | A listagem pode ser filtrada por dono via parâmetro de consulta (`?owner=`)               |
| RF-06 | O sistema responde com erros claros: arquivo ausente (400) e documento inexistente (404)  |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local (`backend/storage`) via `multer` com `diskStorage`        |
| RNF-02 | Metadados mantidos em memória nesta fase (repositório in-memory)                                |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor): `PORT`, `STORAGE_DIR`, `MAX_FILE_SIZE`      |
| RNF-04 | Limite de tamanho de upload configurável; excedido, responder 413 (Payload Too Large)           |
| RNF-05 | O nome físico do arquivo é gerado pelo servidor (id único), nunca o nome original cru, evitando colisões e path traversal |
| RNF-06 | Testes do backend escritos com o runner nativo do Node (`node:test`)                            |

### Variáveis de ambiente

| Variável        | Padrão            | Descrição                                   |
| --------------- | ----------------- | ------------------------------------------- |
| `PORT`          | `3000`            | Porta HTTP do backend                       |
| `STORAGE_DIR`   | `backend/storage` | Diretório local de gravação dos arquivos    |
| `MAX_FILE_SIZE` | `10485760` (10MB) | Tamanho máximo de upload em bytes           |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                                            |
| ------------ | ------ | ---------------------------------------------------- |
| id           | string | Identificador único do documento (UUID)              |
| originalName | string | Nome original do arquivo enviado                     |
| storedName   | string | Nome físico do arquivo no diretório de armazenamento |
| mimeType     | string | Tipo MIME informado no upload                        |
| size         | number | Tamanho em bytes                                     |
| uploadedAt   | string | Data/hora do upload (ISO 8601)                       |
| owner        | string | Identificador do usuário dono                        |

Notas:

- `storedName` é um campo interno (derivado do `id`), usado apenas pelo
  repositório para localizar o arquivo; **não** é exposto pela API.
- A API expõe os campos públicos: `id`, `originalName`, `mimeType`, `size`,
  `uploadedAt`, `owner`.

## 6. Contratos de API

Convenções gerais:

- Erros são retornados em JSON no formato `{ "error": "mensagem em português" }`.
- O frontend consome a API através do prefixo `/api` (o proxy do Vite remove o
  prefixo); o backend expõe as rotas **sem** o prefixo.
- O endpoint `GET /health` existente no seed é mantido.

### POST /upload

Envia um documento.

- Entrada: `multipart/form-data`
  - `file` (obrigatório): o arquivo a enviar
  - `owner` (opcional): identificador do dono; padrão `"anonymous"`
- Respostas:
  - `201 Created` — metadados do documento criado:

    ```json
    {
      "id": "3f8a2c1e-...",
      "originalName": "relatorio.pdf",
      "mimeType": "application/pdf",
      "size": 102400,
      "uploadedAt": "2026-10-28T18:00:00.000Z",
      "owner": "maria"
    }
    ```

  - `400 Bad Request` — arquivo ausente:

    ```json
    { "error": "Nenhum arquivo foi enviado." }
    ```

  - `413 Payload Too Large` — arquivo acima do limite configurado:

    ```json
    { "error": "O arquivo excede o tamanho máximo permitido." }
    ```

### GET /documents

Lista os documentos enviados.

- Entrada: parâmetro de consulta opcional `owner` (ex.: `/documents?owner=maria`)
- Respostas:
  - `200 OK` — array de metadados (vazio se não houver documentos):

    ```json
    [
      {
        "id": "3f8a2c1e-...",
        "originalName": "relatorio.pdf",
        "mimeType": "application/pdf",
        "size": 102400,
        "uploadedAt": "2026-10-28T18:00:00.000Z",
        "owner": "maria"
      }
    ]
    ```

### GET /documents/:id/download

Baixa o conteúdo de um documento.

- Entrada: `id` do documento no caminho
- Respostas:
  - `200 OK` — conteúdo binário do arquivo, com cabeçalhos:
    - `Content-Type: <mimeType>`
    - `Content-Disposition: attachment; filename="<originalName>"`
  - `404 Not Found` — documento não encontrado:

    ```json
    { "error": "Documento não encontrado." }
    ```

### GET /health

Verificação de saúde (já existente no seed).

- Resposta: `200 OK` — `{ "status": "ok" }`

## 7. Decisões arquiteturais

- **Backend em Clean Architecture simples**, dentro de `backend/src`:
  - `routes/` — definem os endpoints, configuram o `multer` e delegam para os
    controllers
  - `controllers/` — tratam entrada/saída HTTP, validação básica e mapeamento
    de erros para códigos de status
  - `services/` — concentram as regras de negócio (criação de metadados,
    listagem, localização para download)
  - `repositories/` — cuidam da persistência: arquivos locais em
    `backend/storage` e metadados em memória
  - Fluxo de dependência: `routes -> controllers -> services -> repositories`;
    camadas internas não conhecem camadas externas.
- **Upload com `multer` + `diskStorage`**, gravando diretamente no diretório
  configurado (`STORAGE_DIR`), com nome físico gerado pelo servidor.
- **Metadados em memória** via repositório in-memory (array/Map), substituível
  futuramente por banco de dados sem alterar as camadas superiores.
- **Frontend baseado em componentes (React + Vite)**:
  - `components/` — `UploadComponent`, `DocumentList`, `DownloadButton`
  - `pages/` — composição da página principal
  - `services/` — comunicação com o backend via `fetch` usando o prefixo `/api`
- **Sem TypeScript nesta fase**: CommonJS no backend, ESM no frontend.
- **Armazenamento local apenas**: nenhum provedor externo de arquivos.

## 8. Plano de execução

Etapas na ordem de implementação (os passos seguintes do workshop):

1. Backend — criar o repositório in-memory de metadados em `repositories/`
2. Backend — criar o serviço de documentos em `services/` (regras de upload,
   listagem, download e validações)
3. Backend — criar os controllers (entrada/validação HTTP e mapeamento de
   erros para códigos de status)
4. Backend — criar as rotas com a configuração do `multer` (`diskStorage` em
   `backend/storage`) e registrá-las no `app.js`
5. Backend — escrever testes com `node:test` (upload, listagem, download e
   cenários de erro)
6. Frontend — criar o serviço `services/documentsApi.js` (chamadas `fetch` via
   `/api`)
7. Frontend — criar os componentes `UploadComponent`, `DocumentList` e
   `DownloadButton`
8. Frontend — integrar os componentes na página principal (`App.jsx`)
9. Integração — validar o fluxo end-to-end com o proxy do Vite e realizar
   ajustes finais
