// Seed do servidor backend do Document Management System.
//
const express = require('express');
const documentsRoutes = require('./routes/documents.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(documentsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
