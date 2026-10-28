async function request(path, options) {
  const response = await fetch(`/api${path}`, options);

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json()
      : null;

    throw new Error(body?.error || `Falha na requisição (HTTP ${response.status}).`);
  }

  return response;
}

export async function listDocuments({ signal } = {}) {
  const response = await request('/documents', { signal });
  return response.json();
}

export async function uploadDocument(file, owner = '') {
  const body = new FormData();
  body.append('file', file);
  if (owner.trim()) {
    body.append('owner', owner.trim());
  }

  const response = await request('/upload', { method: 'POST', body });
  return response.json();
}

export async function downloadDocument(id) {
  const response = await request(`/documents/${encodeURIComponent(id)}/download`);
  return response.blob();
}
