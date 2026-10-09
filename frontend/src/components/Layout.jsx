import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';

const THEME_KEY = 'indian-food-planner-theme';

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export default function Layout(){
  const {user,logout}=useAuth();
  const [theme,setTheme]=useState(() => {
    try { return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'; }
    catch { return 'light'; }
  });

  useEffect(() => { applyTheme(theme); }, [theme]);

  function toggleTheme(){
    setTheme(current => {
      const next = current === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch { /* Theme still works for this session. */ }
      applyTheme(next);
      return next;
    });
  }

  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/">🍛 Food Planner</Link>
      <nav>
        <Link to="/">Planner</Link>
        <Link to="/recipes">Recipe Master</Link>
        <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <span className="user-name">{user?.name}</span>
        <button className="link-button" onClick={logout}>Logout</button>
      </nav>
    </header>
    <main className="page"><Outlet/></main>
  </div>;
}
