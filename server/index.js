const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const axios = require('axios');
const cors = require('cors');
const AdmZip = require('adm-zip');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const upload = multer({ storage: multer.memoryStorage() });

app.get('/api/empresas', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.appsheet.com/api/v2/apps/f381a940-e152-465f-b913-e31e04fd6ab2/tables/Clientes%20Geral/Action',
      {
        Action: 'List',
        Properties: {},
        Rows: [],
      },
      {
        headers: {
          ApplicationAccessKey: process.env.APPSHEET_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

app.post('/api/processar-nota', upload.single('excel'), async (req, res) => {
  const resultados = [];
  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const dados = XLSX.utils.sheet_to_json(sheet);

    for (let i = 0; i < dados.length; i++) {
      const row = dados[i];
      const linha = i + 1;

      if (!row['CPF do responsável'] || !row.Valor || !row.Data) {
        resultados.push({ linha, status: 'Erro', erro: 'Dados inválidos' });
        continue;
      }

      resultados.push({ linha, status: 'Sucesso', detalhes: 'Nota emitida' });
    }

    res.json({ resultados });
  } catch {
    res.status(500).json({ resultados: [{ linha: 0, status: 'Erro', erro: 'Erro no servidor' }] });
  }
});

app.post('/api/coletar-notas', async (req, res) => {
  const { dataInicial, dataFinal } = req.body;
  const zip = new AdmZip();

  try {
    zip.addFile('exemplo.xml', Buffer.from('<nota>Exemplo</nota>'));
    const zipBuffer = zip.toBuffer();

    res.setHeader('Content-Disposition', `attachment; filename=notas_teste.zip`);
    res.setHeader('Content-Type', 'application/zip');
    res.send(zipBuffer);
  } catch {
    res.status(500).json({ message: 'Erro ao coletar notas' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));