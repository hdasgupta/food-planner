import { NavLink, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import RecipesPage from './pages/RecipesPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand">Daily Food Planner</div>
          <div className="subtitle">Indian homemade meals · breakfast to dinner</div>
        </div>
        <nav>
          <NavLink to="/">Today</NavLink>
          <NavLink to="/menu">Planner</NavLink>
          <NavLink to="/recipes">Recipes</NavLink>
        </nav>
      </header>
      <main className="page-container">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
        </Routes>
      </main>
    </div>
  );
}
