import { useState } from 'react';
import { uploadDocument } from '../services/api.js';

export default function UploadComponent({ onUploaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    setError('');
    setSuccess('');
    setIsUploading(true);

    try {
      await uploadDocument(fields.get('file'), fields.get('owner'));
      form.reset();
      setSuccess('Documento enviado com sucesso.');
      onUploaded();
    } catch (error) {
      setError(`Não foi possível enviar o documento: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section aria-labelledby="upload-heading">
      <h2 id="upload-heading">Enviar documento</h2>
      <form onSubmit={handleSubmit} aria-busy={isUploading}>
        <p>
          <label htmlFor="document-file">Arquivo </label>
          <input id="document-file" name="file" type="file" required disabled={isUploading} />
        </p>
        <p>
          <label htmlFor="document-owner">Dono (opcional) </label>
          <input id="document-owner" name="owner" type="text" disabled={isUploading} />
        </p>
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
      {success && <p role="status">{success}</p>}
    </section>
  );
}
