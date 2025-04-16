import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadForm from './components/UploadForm';
import CollectForm from './components/CollectForm';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <nav style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ marginRight: '20px' }}>Emissão</Link>
          <Link to="/coleta">Coleta</Link>
        </nav>
        <Routes>
          <Route path="/" element={<UploadForm />} />
          <Route path="/coleta" element={<CollectForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;