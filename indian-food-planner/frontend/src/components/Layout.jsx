import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout(){
  const {user,logout}=useAuth();
  return <div className="app-shell">
    <header className="topbar">
      <Link className="brand" to="/">🍛 Indian Food Planner</Link>
      <nav>
        <Link to="/">Planner</Link>
        <Link to="/recipes">Recipe Master</Link>
        <span className="user-name">{user?.name}</span>
        <button className="link-button" onClick={logout}>Logout</button>
      </nav>
    </header>
    <main className="page"><Outlet/></main>
  </div>;
}
