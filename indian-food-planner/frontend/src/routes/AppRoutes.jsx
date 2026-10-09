import {Navigate,Route,Routes} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import Layout from '../components/Layout.jsx';
import Planner from '../pages/Planner.jsx';
import Recipes from '../pages/Recipes.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';

function Protected(){
 const {user,loading}=useAuth();
 if(loading) return <div className="loading">Loading…</div>;
 return user?<Layout/>:<Navigate to="/login" replace/>;
}
export default function AppRoutes(){
 return <Routes>
  <Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
  <Route element={<Protected/>}><Route element={<Layout/>}><Route path="/" element={<Planner/>}/><Route path="/recipes" element={<Recipes/>}/></Route></Route>
  <Route path="*" element={<Navigate to="/" replace/>}/>
 </Routes>;
}
