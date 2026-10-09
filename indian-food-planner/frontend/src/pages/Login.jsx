import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
export default function Login(){
 const {login}=useAuth(), nav=useNavigate(); const [form,setForm]=useState({email:'',password:''}); const [error,setError]=useState('');
 const submit=async e=>{e.preventDefault();try{await login(form);nav('/')}catch(x){setError(x.response?.data?.error||'Login failed')}};
 return <div className="auth-page"><form className="auth-card" onSubmit={submit}><h1>Welcome back</h1><p>Plan your homemade Indian meals.</p>{error&&<div className="error">{error}</div>}
 <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
 <input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
 <button className="primary">Login</button><p>New here? <Link to="/register">Create account</Link></p></form></div>
}
