import { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function UploadForm() {
  const [excelFile, setExcelFile] = useState(null);
  const [empresa, setEmpresa] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [descricao, setDescricao] = useState('');
  const [statusLog, setStatusLog] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get('/api/empresas')
      .then((response) => {
        const filteredEmpresas = response.data.filter(
          (e) => e.municipio === 'São José' || e.municipio === 'Biguaçu'
        );
        setEmpresas(filteredEmpresas);
      })
      .catch(() => {
        setStatusLog([{ linha: 0, status: 'Erro', erro: 'Falha ao carregar empresas' }]);
      });
  }, []);

  useEffect(() => {
    if (empresa) {
      const selected = empresas.find((e) => e.nome_empresa === empresa);
      if (selected) {
        setMunicipio(selected.municipio || '');
        setLogin(selected.login || '');
        setSenha(selected.senha || '');
      }
    } else {
      setMunicipio('');
      setLogin('');
      setSenha('');
    }
  }, [empresa, empresas]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusLog([]);
    setIsProcessing(true);

    const formData = new FormData();
    formData.append('excel', excelFile);
    formData.append('login', login);
    formData.append('senha', senha);
    formData.append('descricao', descricao);
    formData.append('municipio', municipio);

    try {
      const response = await axios.post('/api/processar-nota', formData);
      setStatusLog(response.data.resultados);
    } catch {
      setStatusLog([{ linha: 0, status: 'Erro', erro: 'Falha no servidor' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Emissão de Notas</h2>
      <input type="file" onChange={handleFileUpload} accept=".xlsx" disabled={isProcessing} />
      <table style={{ border: '1px solid white', margin: '10px 0', color: 'white' }}>
        <thead>
          <tr>
            <th>Atleta</th>
            <th>Responsável</th>
            <th>CPF</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Cidade</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>{row.Atleta}</td>
              <td>{row['Nome do Responsável']}</td>
              <td>{row['CPF do responsável']}</td>
              <td>{row.Valor}</td>
              <td>{row.Data}</td>
              <td>{row.Cidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={handleSubmit}>
        <select
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          disabled={isProcessing}
          style={{ padding: '5px', margin: '5px 0' }}
        >
          <option value="">Escolha uma empresa</option>
          {empresas.map((e) => (
            <option key={e.nome_empresa} value={e.nome_empresa}>
              {e.nome_empresa}
            </option>
          ))}
        </select>
        <input value={municipio} readOnly placeholder="Município" style={{ margin: '5px 0' }} />
        <input value={login} readOnly placeholder="Login" style={{ margin: '5px 0' }} />
        <input
          type="password"
          value={senha}
          readOnly
          placeholder="Senha"
          style={{ margin: '5px 0' }}
        />
        <textarea
          placeholder="Descrição (ex.: Mensalidade)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={isProcessing}
          style={{ margin: '5px 0', height: '60px' }}
        />
        <button type="submit" disabled={isProcessing} style={{ margin: '5px 0' }}>
          {isProcessing ? 'Processando...' : 'Emitir Notas'}
        </button>
      </form>
      <h3>Status</h3>
      <div style={{ border: '1px solid white', padding: '10px', color: 'white' }}>
        {statusLog.map((log, index) => (
          <div key={index}>
            Linha {log.linha} - {log.status}: {log.erro || 'Sucesso'}
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadForm;
