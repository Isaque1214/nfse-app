import { useState, useEffect } from 'react';
import axios from 'axios';

function CollectForm() {
  const [empresa, setEmpresa] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [empresas, setEmpresas] = useState([]);

  const meses = [
    { nome: 'Janeiro', valor: 1 },
    { nome: 'Fevereiro', valor: 2 },
    { nome: 'Março', valor: 3 },
    { nome: 'Abril', valor: 4 },
    { nome: 'Maio', valor: 5 },
    { nome: 'Junho', valor: 6 },
    { nome: 'Julho', valor: 7 },
    { nome: 'Agosto', valor: 8 },
    { nome: 'Setembro', valor: 9 },
    { nome: 'Outubro', valor: 10 },
    { nome: 'Novembro', valor: 11 },
    { nome: 'Dezembro', valor: 12 },
  ];

  useEffect(() => {
    axios.get('/api/empresas').then((response) => {
      setEmpresas(response.data);
    }).catch(() => {
      setStatus('Erro ao carregar empresas');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Buscando notas...');
    setIsProcessing(true);

    if (!mes || !ano || ano < 2000 || ano > 2030) {
      setStatus('Mês ou ano inválido');
      setIsProcessing(false);
      return;
    }

    const dataInicial = `01/${mes.padStart(2, '0')}/${ano}`;
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const dataFinal = `${ultimoDia}/${mes.padStart(2, '0')}/${ano}`;

    try {
      const response = await axios.post('/api/coletar-notas', {
        login,
        senha,
        municipio,
        dataInicial,
        dataFinal,
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `notas_${empresa}_${meses[mes - 1].nome}_${ano}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setStatus('Notas coletadas!');
    } catch {
      setStatus('Erro ao coletar notas');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h2>Coleta de Notas</h2>
      <form onSubmit={handleSubmit}>
        <select
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          disabled={isProcessing}
        >
          <option value="">Escolha uma empresa</option>
          {empresas.map((e) => (
            <option key={e.nome_empresa} value={e.nome_empresa}>{e.nome_empresa}</option>
          ))}
        </select>
        <input value={municipio} readOnly placeholder="Município" />
        <input value={login} readOnly placeholder="Login" />
        <input type="password" value={senha} readOnly placeholder="Senha" />
        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          disabled={isProcessing}
        >
          <option value="">Escolha o mês</option>
          {meses.map((m) => (
            <option key={m.valor} value={m.valor}>{m.nome}</option>
          ))}
        </select>
        <input
          type="text"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          placeholder="Ano (ex.: 2025)"
          disabled={isProcessing}
        />
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Processando...' : 'Coletar Notas'}
        </button>
      </form>
      <h3>Status</h3>
      <div style={{ border: '1px solid black', padding: '10px' }}>
        {status || 'Aguardando...'}
      </div>
    </div>
  );
}

export default CollectForm;