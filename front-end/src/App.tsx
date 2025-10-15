import { Routes, Route } from 'react-router-dom';

// Vamos chamar o componente da página inicial de "PaginaPrincipal" para não confundir com "Home"
import PaginaPrincipal from './pages/PaginaPrincipal.tsx';
import Commits from './pages/Commits.tsx';
import Documentacao from './pages/Documentacao.tsx';
import Issues from "./pages/Issues.tsx";
import PullRequestsPage from "./pages/PullRequests.tsx";

function App() {
  return (
    <Routes>
      {/* Rota Inicial: O caminho "/" renderiza o componente da página principal */}
      <Route path="/" element={<PaginaPrincipal />} />
      <Route path="/home" element={<PaginaPrincipal />} />

      {/* Rota de Commits */}
      <Route path="/commits" element={<Commits />} />

      {/* Rota de Documentação */}
      <Route path="/documentacao" element={<Documentacao />} />

      <Route path="/issues" element={<Issues />} />
      <Route path="/pullrequests" element={<PullRequestsPage />} />
    </Routes>
  );
}

export default App;